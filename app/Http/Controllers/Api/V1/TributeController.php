<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreCandleRequest;
use App\Http\Requests\Api\V1\StoreTributeRequest;
use App\Http\Resources\CandleResource;
use App\Http\Resources\TributeResource;
use App\Jobs\ProcessTributeAudioTranscription;
use App\Media\MediaManager;
use App\Models\Candle;
use App\Models\Room;
use App\Models\Tribute;
use App\Notifications\TributeReceived;
use App\Services\ActivityLogger;
use App\Services\ExpoPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TributeController extends Controller
{
    public function __construct(
        protected ActivityLogger $activityLogger,
        protected MediaManager $mediaManager,
    ) {}

    public function store(StoreTributeRequest $request, Room $room): JsonResponse
    {
        if ($room->contributionBlockReason() !== null) {
            return response()->json(['message' => 'Contributions are closed for this room.', 'reason' => $room->contributionBlockReason()], 403);
        }

        $validated = $request->validated();

        $savedImagePaths = [];
        $totalBytes = 0;
        if (! empty($validated['images'] ?? null)) {
            foreach ($validated['images'] as $image) {
                $media = $this->mediaManager->uploadImage($image);
                $savedImagePaths[] = $media->url();
                $totalBytes += (int) ($media->size ?? $image->getSize() ?? 0);
            }
        }

        $savedVideoPath = null;
        if (! empty($validated['video'] ?? null)) {
            $media = $this->mediaManager->uploadVideo($request->file('video'));
            $savedVideoPath = $media->url();
            $totalBytes += (int) ($media->size ?? $request->file('video')->getSize() ?? 0);
        }

        $savedAudioPath = null;
        if (! empty($validated['audio'] ?? null) && str_starts_with($validated['audio'], 'data:')) {
            [$meta, $data] = explode(';', $validated['audio'], 2);
            $mime = str_replace('data:', '', $meta);
            $extension = match ($mime) {
                'audio/webm' => 'webm',
                'audio/ogg' => 'ogg',
                'audio/mp4' => 'mp4',
                'audio/mpeg' => 'mp3',
                'audio/wav' => 'wav',
                default => 'bin',
            };
            $base64Data = str_replace('base64,', '', $data);
            $binaryData = base64_decode($base64Data);
            $filename = uniqid('tribute_', true).'.'.$extension;
            Storage::disk('public')->put('tributes/'.$room->id.'/audio/'.$filename, $binaryData);
            $savedAudioPath = '/tributes/'.$room->id.'/audio/'.$filename;
            $totalBytes += strlen($binaryData);
        }

        $autoApprove = $room->room_type?->value === 'birthday';

        $tribute = $room->tributes()->create([
            'name' => $validated['name'],
            'relationship' => $validated['relationship'] ?? null,
            'message' => $validated['message'] ?? '',
            'quote' => $validated['quote'] ?? null,
            'images' => $savedImagePaths,
            'video' => $savedVideoPath,
            'audio' => $savedAudioPath,
            'audio_transcript_status' => $savedAudioPath ? 'processing' : 'pending',
            'is_approved' => $autoApprove,
        ]);

        if ($totalBytes > 0) {
            $room->addStorageBytes($totalBytes);
        }

        if ($request->user()) {
            $this->activityLogger->log(
                "Created tribute for room: {$room->name}",
                Tribute::class,
                (string) $tribute->id,
                ['room_id' => $room->id, 'room_name' => $room->name]
            );
        } else {
            $this->activityLogger->logForGuest(
                "Created tribute for room: {$room->name}",
                ['guest_name' => $validated['name'], 'guest_email' => $validated['email'] ?? null],
                Tribute::class,
                (string) $tribute->id
            );
        }

        if ($savedAudioPath) {
            ProcessTributeAudioTranscription::dispatch($tribute);
        }

        if ($room->creator) {
            $room->creator->notify(new TributeReceived($tribute));
            try {
                app(ExpoPushService::class)->sendToUser($room->creator, 'New Tribute', "A new tribute for \"{$room->name}\" needs approval.", ['type' => 'tribute_received', 'room_slug' => $room->slug, 'room_id' => $room->id]);
            } catch (\Throwable $e) {
                // non-blocking — expo push failures should not block tribute creation
            }
        }

        $message = $autoApprove
            ? 'Your wish has been submitted and is now live!'
            : 'Your tribute has been submitted and is pending approval.';

        return response()->json([
            'data' => new TributeResource($tribute),
            'message' => $message,
        ], 201);
    }

    public function lightCandle(StoreCandleRequest $request, Room $room): JsonResponse
    {
        if ($room->contributionBlockReason() !== null) {
            return response()->json(['message' => 'Contributions are closed for this room.', 'reason' => $room->contributionBlockReason()], 403);
        }

        $validated = $request->validated();

        $candle = $room->candles()->create([
            'name' => $validated['name'],
            'message' => $validated['message'] ?? null,
            'candle_type' => $validated['candle_type'],
            'is_approved' => false,
        ]);

        if ($request->user()) {
            $this->activityLogger->log(
                "Lit candle for room: {$room->name}",
                Candle::class,
                (string) $candle->id,
                ['room_id' => $room->id, 'room_name' => $room->name]
            );
        } else {
            $this->activityLogger->logForGuest(
                "Lit candle for room: {$room->name}",
                ['guest_name' => $validated['name']],
                Candle::class,
                (string) $candle->id
            );
        }

        if ($room->creator) {
            try {
                app(ExpoPushService::class)->sendToUser($room->creator, 'New Candle', "A candle was lit for \"{$room->name}\".", ['type' => 'candle_received', 'room_slug' => $room->slug, 'room_id' => $room->id]);
            } catch (\Throwable $e) {
            }
        }

        return response()->json([
            'data' => new CandleResource($candle),
            'message' => 'Candle lit successfully.',
        ], 201);
    }

    public function approve(Tribute $tribute): JsonResponse
    {
        $tribute->update(['is_approved' => true]);

        $this->activityLogger->log(
            "Approved tribute for room: {$tribute->room->name}",
            Tribute::class,
            (string) $tribute->id,
            ['room_id' => $tribute->room->id, 'room_name' => $tribute->room->name]
        );

        return response()->json(['data' => new TributeResource($tribute->fresh())]);
    }

    public function approveCandle(Candle $candle): JsonResponse
    {
        $candle->update(['is_approved' => true]);

        return response()->json(['data' => new CandleResource($candle->fresh())]);
    }

    public function destroy(Tribute $tribute): JsonResponse
    {
        $tribute->delete();

        $this->activityLogger->log(
            "Deleted tribute from room: {$tribute->room->name}",
            Tribute::class,
            (string) $tribute->id,
            ['room_id' => $tribute->room->id, 'room_name' => $tribute->room->name]
        );

        return response()->json(['message' => 'Tribute deleted.']);
    }

    public function storeShare(StoreTributeRequest $request, string $slug): JsonResponse
    {
        $room = Room::where('slug', $slug)->firstOrFail();

        // Re-use store logic via fake room resolution
        return $this->store($request, $room);
    }

    public function lightCandleShare(StoreCandleRequest $request, string $slug): JsonResponse
    {
        $room = Room::where('slug', $slug)->firstOrFail();

        return $this->lightCandle($request, $room);
    }
}
