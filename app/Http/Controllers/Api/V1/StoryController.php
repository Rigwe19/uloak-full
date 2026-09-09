<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreStoryRequest;
use App\Http\Resources\StoryResource;
use App\Media\MediaManager;
use App\Models\Media;
use App\Models\Room;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function __construct(protected MediaManager $mediaManager) {}

    public function index(Room $room, Request $request): JsonResponse
    {
        $validated = $request->validate(['cursor' => ['nullable', 'string'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $paginator = $room->stories()->latest()->cursorPaginate($validated['per_page'] ?? 24);

        return response()->json([
            'data' => StoryResource::collection($paginator->getCollection()),
            'pagination' => ['next_cursor' => $paginator->nextCursor()?->encode(), 'per_page' => $paginator->perPage()],
        ]);
    }

    public function show(Story $story): JsonResponse
    {
        $story->load(['user', 'room']);

        return response()->json(['data' => new StoryResource($story)]);
    }

    public function store(StoreStoryRequest $request, Room $room): JsonResponse
    {
        if ($room->contributionBlockReason() !== null) {
            return response()->json(['message' => 'Contributions are closed for this room.', 'reason' => $room->contributionBlockReason()], 403);
        }

        $validated = $request->validated();
        $data = [
            'room_id' => $room->id,
            'user_id' => $request->user()?->id,
            'guest_name' => $request->user()?->name,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'tags' => $validated['tags'] ?? [],
            'follow_up_to' => $validated['follow_up_to'] ?? null,
        ];

        if ($request->hasFile('file')) {
            $media = $validated['type'] === 'video' ? $this->mediaManager->uploadVideo($request->file('file')) : $this->mediaManager->uploadImage($request->file('file'));
            $data['file_url'] = $media->url();
            $data['thumbnail'] = $media->thumbnail ?? $media->url();
        }
        if ($request->hasFile('thumbnail')) {
            $thumb = $this->mediaManager->uploadImage($request->file('thumbnail'));
            $data['thumbnail'] = $thumb->url();
        }

        $story = Story::create($data);

        return response()->json(['data' => new StoryResource($story)], 201);
    }

    public function destroy(Story $story): JsonResponse
    {
        $user = auth()->user();
        if ($user && $story->user_id !== $user->id && $story->room->created_by !== $user->id) {
            abort(403);
        }
        $story->delete();

        return response()->json(['message' => 'Story deleted.']);
    }

    public function processingStatus(Story $story): JsonResponse
    {
        $assets = $story->assets ?? [];
        $isProcessing = false;
        if (! empty($assets)) {
            $uuids = collect($assets)->pluck('media_uuid')->filter()->all();
            if (! empty($uuids)) {
                $mediaMap = Media::whereIn('uuid', $uuids)->get()->keyBy('uuid');
                foreach ($assets as $asset) {
                    $uuid = $asset['media_uuid'] ?? null;
                    if ($uuid && isset($mediaMap[$uuid]) && in_array($mediaMap[$uuid]->status, ['uploading', 'processing'], true)) {
                        $isProcessing = true;
                        break;
                    }
                }
            }
        } elseif ($story->type === 'video' && empty($story->file_url)) {
            $isProcessing = true;
        }

        return response()->json(['is_processing' => $isProcessing, 'assets' => $assets]);
    }
}
