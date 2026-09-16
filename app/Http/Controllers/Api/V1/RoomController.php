<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreRoomRequest;
use App\Http\Requests\Api\V1\UpdateRoomRequest;
use App\Http\Resources\CandleResource;
use App\Http\Resources\RoomResource;
use App\Http\Resources\StoryResource;
use App\Http\Resources\TributeResource;
use App\Media\MediaManager;
use App\Models\Client;
use App\Models\Media;
use App\Models\Room;
use App\Services\ActivityLogger;
use App\Services\RoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    public function __construct(
        protected RoomService $roomService,
        protected ActivityLogger $activityLogger,
        protected MediaManager $mediaManager,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $rooms = Room::where(function ($q) use ($request) {
            $q->where('created_by', $request->user()->id)
                ->orWhereIn('id', $request->user()->rooms()->select('rooms.id'));
        })->withCount(['stories', 'tributes'])->latest()->paginate(20);

        return RoomResource::collection($rooms)->response();
    }

    public function show(Room $room): JsonResponse
    {
        $this->authorize('view', $room);

        $room = $this->roomService->getRoomDetails($room);
        $room->loadCount(['stories', 'tributes']);
        $room->load(['tributes' => fn ($q) => $q->latest(), 'candles' => fn ($q) => $q->latest(), 'stories' => fn ($q) => $q->latest()->limit(24)]);

        return response()->json([
            'data' => [
                'room' => new RoomResource($room),
                'stories' => StoryResource::collection($room->stories),
                'tributes' => TributeResource::collection($room->tributes),
                'candles' => CandleResource::collection($room->candles),
            ],
        ]);
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('thumbnail')) {
            $media = $this->mediaManager->uploadImage($request->file('thumbnail'));
            $validated['thumbnail'] = $media->url();
        }
        if ($request->hasFile('tribute_song')) {
            $media = $this->mediaManager->uploadAudio($request->file('tribute_song'));
            $validated['tribute_song'] = $media->url();
        }
        if ($request->hasFile('media_items')) {
            $mediaItems = [];
            foreach ($request->file('media_items') as $file) {
                $media = $this->uploadViaPipeline($file);
                $mediaItems[] = ['url' => $media->url(), 'type' => str_starts_with($media->mime_type, 'video') ? 'video' : 'image'];
            }
            $validated['media_items'] = $mediaItems;
        }

        $paywalledTypes = ['wedding', 'birthday', 'burial', 'memorial', 'anniversary', 'graduation'];
        $requestedType = $validated['room_type'] ?? 'general';
        $requestedTier = $validated['tier_type'] ?? null;

        if (in_array($requestedType, $paywalledTypes, true) || $requestedTier === 'full_room' || $requestedTier === 'family_archive') {
            return response()->json([
                'message' => 'This occasion requires a paid Full Room. Use POST /api/v1/billing/checkout.',
                'requires_checkout' => true,
                'room_type' => $requestedType,
            ], 402);
        }

        $room = $this->roomService->createRoom($request->user(), $validated);

        if ($request->filled('client_id')) {
            $client = Client::find($request->input('client_id'));
            if ($client && $client->business_user_id === $request->user()->id) {
                $room->clients()->syncWithoutDetaching([$client->id]);
            }
        }

        $this->activityLogger->log("Created room: {$room->name}", Room::class, (string) $room->id, ['room_name' => $room->name]);

        return response()->json(['data' => new RoomResource($room)], 201);
    }

    public function update(UpdateRoomRequest $request, Room $room): JsonResponse
    {
        $this->authorize('update', $room);

        $validated = $request->validated();

        if ($request->hasFile('thumbnail')) {
            $media = $this->mediaManager->uploadImage($request->file('thumbnail'));
            $validated['thumbnail'] = $media->url();
        }
        if ($request->hasFile('tribute_song')) {
            $media = $this->mediaManager->uploadAudio($request->file('tribute_song'));
            $validated['tribute_song'] = $media->url();
        }

        $existingMedia = [];
        if ($request->input('existing_media_urls')) {
            $decoded = json_decode($request->input('existing_media_urls'), true);
            if (is_array($decoded)) {
                foreach ($decoded as $url) {
                    $existingMedia[] = ['url' => $url, 'type' => str_contains($url, '.mp4') || str_contains($url, '.mov') ? 'video' : 'image'];
                }
            }
        }

        $newMedia = [];
        if ($request->hasFile('media_files')) {
            foreach ($request->file('media_files') as $file) {
                $media = $this->uploadViaPipeline($file);
                $newMedia[] = ['url' => $media->url(), 'type' => str_starts_with($media->mime_type, 'video') ? 'video' : 'image'];
            }
        }

        $validated['media_items'] = array_merge($existingMedia, $newMedia);
        $room->update($validated);

        return response()->json(['data' => new RoomResource($room->fresh())]);
    }

    public function destroy(Room $room): JsonResponse
    {
        $this->authorize('delete', $room);
        $room->delete();

        return response()->json(['message' => 'Room deleted.']);
    }

    public function feed(Room $room, Request $request): JsonResponse
    {
        $validated = $request->validate(['cursor' => ['nullable', 'integer'], 'limit' => ['nullable', 'integer', 'min:1', 'max:20']]);
        $limit = $validated['limit'] ?? 10;

        $query = $room->stories()->where('type', 'video')->with(['user'])->withCount(['likes', 'comments'])->orderBy('id', 'desc');

        if (! empty($validated['cursor'])) {
            $query->where('id', '<', $validated['cursor']);
        }

        $stories = $query->take($limit)->get();
        $user = $request->user();
        $guestEmail = $request->cookie('ulo_guest_email');
        $guestIdentifier = $guestEmail ? hash('sha256', strtolower($guestEmail)) : null;

        $data = $stories->map(fn ($s) => [
            'id' => $s->id, 'uuid' => $s->uuid, 'title' => $s->title, 'description' => $s->description, 'type' => $s->type,
            'file_url' => $s->file_url ? (str_starts_with($s->file_url, 'http') || str_starts_with($s->file_url, '/storage') ? $s->file_url : Storage::disk('public')->url(ltrim($s->file_url, '/'))) : null,
            'thumbnail' => $s->thumbnail ? (str_starts_with($s->thumbnail, 'http') || str_starts_with($s->thumbnail, '/storage') ? $s->thumbnail : Storage::disk('public')->url(ltrim($s->thumbnail, '/'))) : null,
            'author' => $s->user?->name ?? $s->guest_name, 'date' => $s->created_at->format('M d, Y'),
            'likes_count' => $s->likes_count, 'comments_count' => $s->comments_count,
            'is_liked' => $user ? $s->likes()->where('user_id', $user->id)->exists() : ($guestIdentifier ? $s->likes()->where('guest_identifier', $guestIdentifier)->exists() : false),
        ]);

        return response()->json(['data' => $data, 'next_cursor' => $stories->last()?->id, 'has_more' => $stories->count() === $limit]);
    }

    protected function uploadViaPipeline(UploadedFile $file): Media
    {
        $mime = $file->getMimeType() ?: $file->getClientMimeType();

        return str_starts_with($mime, 'video/') ? $this->mediaManager->uploadVideo($file) : $this->mediaManager->uploadImage($file);
    }
}
