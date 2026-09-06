<?php

namespace App\Http\Controllers;

use App\Events\MediaDeleted;
use App\Events\MediaProcessingStarted;
use App\Media\Enums\ProcessingState;
use App\Media\Exceptions\MediaNotFoundException;
use App\Media\Exceptions\MediaProcessingException;
use App\Media\Exceptions\UnsupportedFormatException;
use App\Media\MediaManager;
use App\Models\Event;
use App\Models\GuestIdentity;
use App\Models\Media;
use App\Models\Room;
use App\Models\RoomGuestSubscription;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function __construct(
        protected MediaManager $mediaManager,
    ) {}

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:512000'],
            'type' => ['nullable', 'string', 'in:video,image,audio,document'],
        ]);

        $file = $request->file('file');
        $type = $request->input('type');
        $mime = $file->getMimeType() ?: $file->getClientMimeType();
        $ext = strtolower($file->getClientOriginalExtension());

        $isVideo = $type === 'video'
            || str_starts_with((string) $mime, 'video/')
            || in_array($ext, ['mp4', 'mov', 'avi', 'mkv', 'webm'], true);

        try {
            $media = $isVideo
                ? $this->mediaManager->uploadVideo($file)
                : $this->mediaManager->uploadImage($file);
        } catch (UnsupportedFormatException $e) {
            // Try the alternative processor before failing
            try {
                $media = $isVideo
                    ? $this->mediaManager->uploadImage($file)
                    : $this->mediaManager->uploadVideo($file);
            } catch (\Throwable $inner) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'mime_type' => $e->mimeType,
                ], 415);
            }
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }

        MediaProcessingStarted::dispatch($media);

        $thumb = $media->attributes['thumbnail'] ?? $media->thumbnail ?? null;
        if (is_string($thumb) && str_starts_with($thumb, 'http')) {
            $thumbUrl = $thumb;
        } elseif (is_string($thumb) && $thumb !== '' && $thumb !== null) {
            try {
                $thumbUrl = (str_starts_with($thumb, 'http') || str_starts_with($thumb, '/storage') ? $thumb : Storage::disk($media->disk)->url(ltrim($thumb, '/')));
            } catch (\Throwable) {
                $thumbUrl = $thumb;
            }
        } else {
            $thumbUrl = null;
        }

        return response()->json([
            'data' => [
                'id' => $media->uuid,
                'uuid' => $media->uuid,
                'url' => $media->url(),
                'type' => $media->type,
                'mime_type' => $media->mime_type,
                'status' => $media->status,
                'provider' => $media->provider,
                'thumbnail_url' => $thumbUrl,
                'sprite' => $media->sprite,
            ],
        ], 200);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400'],
        ]);

        $file = $request->file('file');

        try {
            $media = $this->mediaManager->uploadImage($file);
        } catch (UnsupportedFormatException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'mime_type' => $e->mimeType,
            ], 415);
        }

        MediaProcessingStarted::dispatch($media);

        return response()->json([
            'data' => [
                'id' => $media->uuid,
                'uuid' => $media->uuid,
                'url' => $media->url(),
                'type' => $media->type,
                'mime_type' => $media->mime_type,
                'width' => $media->width,
                'height' => $media->height,
                'status' => $media->status,
            ],
        ], 201);
    }

    public function uploadVideo(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:512000', 'mimes:mp4,mov,avi,mkv,webm'],
        ]);

        $file = $request->file('file');

        try {
            $media = $this->mediaManager->uploadVideo($file);
        } catch (UnsupportedFormatException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'mime_type' => $e->mimeType,
            ], 415);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }

        MediaProcessingStarted::dispatch($media);

        $thumb = $media->attributes['thumbnail'] ?? $media->thumbnail ?? null;
        if (is_string($thumb) && str_starts_with($thumb, 'http')) {
            $thumbUrl = $thumb;
        } elseif (is_string($thumb) && $thumb !== '' && $thumb !== null) {
            try {
                $thumbUrl = (str_starts_with($thumb, 'http') || str_starts_with($thumb, '/storage') ? $thumb : Storage::disk($media->disk)->url(ltrim($thumb, '/')));
            } catch (\Throwable) {
                $thumbUrl = $thumb;
            }
        } else {
            $thumbUrl = null;
        }

        return response()->json([
            'data' => [
                'id' => $media->uuid,
                'uuid' => $media->uuid,
                'url' => $media->url(),
                'type' => $media->type,
                'mime_type' => $media->mime_type,
                'status' => $media->status,
                'provider' => $media->provider,
                'thumbnail_url' => $thumbUrl,
                'sprite' => $media->sprite,
            ],
        ], 201);
    }

    public function uploadGuestVideo(Request $request): JsonResponse
    {
        return $this->handleGuestUpload($request, 'video');
    }

    public function uploadGuestImage(Request $request): JsonResponse
    {
        return $this->handleGuestUpload($request, 'image');
    }

    public function uploadGuest(Request $request): JsonResponse
    {
        return $this->handleGuestUpload($request, null);
    }

    protected function handleGuestUpload(Request $request, ?string $forcedType): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:512000', 'mimes:mp4,mov,avi,mkv,webm,jpg,jpeg,png,webp,heic,heif,mp3,wav,m4a,ogg,webm'],
            'room_slug' => ['nullable', 'string', 'required_without:event_slug'],
            'event_slug' => ['nullable', 'string', 'required_without:room_slug'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'guest_whatsapp' => ['nullable', 'string', 'max:30', 'regex:/^\+?[0-9\s\-\(\)]+$/'],
            'type' => ['nullable', 'string', 'in:video,image,audio,photo'],
        ]);

        $room = null;
        $event = null;

        if ($request->filled('room_slug')) {
            $room = Room::where('slug', $request->input('room_slug'))->first();

            if (! $room) {
                return response()->json(['message' => 'Room not found.'], 404);
            }

            if (! $room->contributionsOpen()) {
                return response()->json(['message' => $room->contributionBlockReason() ?? 'Contributions are closed.'], 403);
            }
        }

        if ($request->filled('event_slug')) {
            $event = Event::where('slug', $request->input('event_slug'))->first();

            if (! $event) {
                return response()->json(['message' => 'Event not found.'], 404);
            }
        }

        $guest = GuestIdentity::create([
            'room_id' => $room?->id,
            'event_id' => $event?->id,
            'name' => $request->input('guest_name'),
            'email' => $request->input('guest_email'),
            'whatsapp' => $request->input('guest_whatsapp'),
            'ip_address' => $request->ip(),
            'expires_at' => now()->addHours(24),
        ]);

        // Keep RoomGuestSubscription in sync for organizer visibility/reminders
        if ($room && $request->filled('guest_email')) {
            RoomGuestSubscription::firstOrCreate(
                ['room_id' => $room->id, 'email' => $request->input('guest_email')],
                ['name' => $request->input('guest_name')]
            );
        }

        $file = $request->file('file');
        $rawMime = $file->getMimeType() ?: $file->getClientMimeType();
        $mime = strtolower(trim(explode(';', (string) $rawMime)[0]));
        $ext = strtolower($file->getClientOriginalExtension());
        $type = $forcedType ?? $request->input('type');
        $isAudio = $type === 'audio' || str_starts_with($mime, 'audio/') || in_array($ext, ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'opus', 'flac', 'webm'], true) && str_contains($mime, 'audio');
        // Prefer explicit audio detection before video because audio/webm;codecs=opus reports as webm ext but is audio
        if ($type === 'audio') {
            $isAudio = true;
        }
        $isVideo = ! $isAudio && ($type === 'video' || str_starts_with($mime, 'video/') || in_array($ext, ['mp4', 'mov', 'avi', 'mkv', 'webm'], true));

        try {
            if ($isAudio) {
                $media = $this->mediaManager->uploadAudio($file);
            } elseif ($isVideo) {
                $media = $this->mediaManager->uploadVideo($file);
            } else {
                $media = $this->mediaManager->uploadImage($file);
            }
        } catch (UnsupportedFormatException $e) {
            try {
                // Fallback: try audio then video/image as last resort
                if (! $isAudio) {
                    $media = $this->mediaManager->uploadAudio($file);
                } else {
                    $media = $isVideo ? $this->mediaManager->uploadImage($file) : $this->mediaManager->uploadVideo($file);
                }
            } catch (\Throwable $inner) {
                return response()->json(['message' => $e->getMessage(), 'mime_type' => $e->mimeType], 415);
            }
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        // Link ephemeral guest for audit/watermark provenance
        $media->update(['guest_identity_id' => $guest->id, 'metadata' => array_merge($media->metadata ?? [], ['guest_name' => $guest->name, 'guest_email' => $guest->email, 'guest_whatsapp' => $guest->whatsapp, 'guest_uuid' => $guest->uuid])]);

        // Audio has no ffmpeg transcode — mark ready immediately so polling resolves (was stuck at uploading/progress 0)
        if ($isAudio) {
            $media->update([
                'status' => ProcessingState::Ready->value,
                'progress' => 100,
                'processing_completed_at' => now(),
            ]);
            $media->refresh();
        }

        if (! $isAudio) {
            MediaProcessingStarted::dispatch($media);
        }

        $thumb = $media->attributes['thumbnail'] ?? $media->thumbnail ?? null;
        $thumbUrl = is_string($thumb) && $thumb !== '' ? (str_starts_with($thumb, 'http') ? $thumb : (function () use ($media, $thumb) {
            try {
                return str_starts_with($thumb, 'http') || str_starts_with($thumb, '/storage') ? $thumb : Storage::disk($media->disk)->url(ltrim($thumb, '/'));
            } catch (\Throwable) {
                return $thumb;
            }
        })()) : null;

        return response()->json([
            'data' => [
                'id' => $media->uuid,
                'uuid' => $media->uuid,
                'url' => $media->url(),
                'type' => $media->type,
                'mime_type' => $media->mime_type,
                'status' => $media->status,
                'provider' => $media->provider,
                'thumbnail_url' => $thumbUrl,
                'sprite' => $media->sprite,
                'guest_identity_uuid' => $guest->uuid,
            ],
        ], 201);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            $media = Media::where('uuid', $uuid)->firstOrFail();
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Media not found.'], 404);
        }

        $thumbnail = null;
        if ($media->isImage()) {
            try {
                $thumbnail = $media->thumbnail(300, 300);
            } catch (\RuntimeException) {
                $thumbnail = null;
            }
        }

        return response()->json([
            'data' => [
                'id' => $media->uuid,
                'original_name' => $media->original_name,
                'mime_type' => $media->mime_type,
                'width' => $media->width,
                'height' => $media->height,
                'size' => $media->size,
                'type' => $media->type,
                'url' => $media->url(),
                'thumbnail' => $thumbnail,
                'preview' => $media->preview,
                'status' => $media->status,
                'progress' => $media->progress,
                'provider' => $media->provider,
                'duration' => $media->duration,
                'sprite' => $media->sprite,
            ],
        ]);
    }

    public function processImage(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'width' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'height' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'mode' => ['nullable', 'string', 'in:resize,fit,contain'],
            'quality' => ['nullable', 'integer', 'min:1', 'max:100'],
            'format' => ['nullable', 'string', 'in:webp,jpeg,png'],
        ]);

        try {
            $builder = $this->mediaManager->image($uuid);

            if ($request->filled('width')) {
                $builder->width((int) $request->input('width'));
            }
            if ($request->filled('height')) {
                $builder->height((int) $request->input('height'));
            }
            if ($request->filled('mode')) {
                $mode = $request->input('mode');
                if ($mode === 'fit') {
                    $builder->fit();
                } elseif ($mode === 'contain') {
                    $builder->contain();
                }
            }
            if ($request->filled('quality')) {
                $builder->quality((int) $request->input('quality'));
            }

            $url = $builder->format($request->input('format', 'webp'));
        } catch (MediaNotFoundException|MediaProcessingException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }

        return response()->json([
            'data' => [
                'url' => $url,
            ],
        ]);
    }

    public function serveImage(string $uuid, string $size, string $format): Response
    {
        $media = Media::where('uuid', $uuid)->first();

        if (! $media || $media->type !== 'image') {
            abort(404, 'Image not found.');
        }

        $parts = explode('x', $size);
        $width = (int) ($parts[0] ?? 0);
        $height = (int) ($parts[1] ?? 0);

        if ($width < 1 || $height < 1) {
            abort(400, 'Invalid size format. Use {width}x{height}.');
        }

        try {
            [$content, $mimeType] = $this->mediaManager
                ->forMedia($media)
                ->width($width)
                ->height($height)
                ->fit()
                ->quality((int) config('media.image.quality', 80))
                ->format($format)
                ->serve();
        } catch (MediaProcessingException $e) {
            abort(500, $e->getMessage());
        }

        $etag = md5($content);

        if ($request = request()) {
            if ($request->header('If-None-Match') === "\"{$etag}\"") {
                return response()->noContent(304);
            }
        }

        return response($content, 200, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'ETag' => "\"{$etag}\"",
        ]);
    }

    public function destroy(string $uuid): JsonResponse
    {
        try {
            $media = Media::where('uuid', $uuid)->firstOrFail();
            $this->mediaManager->forMedia($media)->delete();
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Media not found.'], 404);
        }

        MediaDeleted::dispatch($media);

        return response()->json(['message' => 'Media deleted.'], 200);
    }
}
