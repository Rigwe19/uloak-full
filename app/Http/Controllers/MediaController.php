<?php

namespace App\Http\Controllers;

use App\Events\MediaDeleted;
use App\Events\MediaProcessingStarted;
use App\Media\Exceptions\MediaNotFoundException;
use App\Media\Exceptions\MediaProcessingException;
use App\Media\Exceptions\UnsupportedFormatException;
use App\Media\MediaManager;
use App\Models\Media;
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
                'id' => $media->id,
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

        return response()->json([
            'data' => [
                'id' => $media->id,
                'uuid' => $media->uuid,
                'url' => $media->url(),
                'type' => $media->type,
                'mime_type' => $media->mime_type,
                'status' => $media->status,
                'thumbnail_url' => $media->thumbnail
                    ? Storage::disk($media->disk)->url($media->thumbnail)
                    : null,
                'sprite' => $media->sprite,
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
