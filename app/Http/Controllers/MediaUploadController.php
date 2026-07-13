<?php

namespace App\Http\Controllers;

use App\Media\Cloudinary\CloudinaryVideoProcessor;
use App\Media\Cloudinary\MediaUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaUploadController extends Controller
{
    public function __construct(
        protected MediaUploadService $uploadService,
        protected CloudinaryVideoProcessor $videoProcessor,
    ) {}

    public function signVideo(Request $request): JsonResponse
    {
        return $this->sign($request);
    }

    public function sign(Request $request): JsonResponse
    {
        $request->validate([
            'mime_type' => ['required', 'string', 'max:255'],
            'size' => ['required', 'integer', 'min:1', 'max:1073741824'],
            'original_name' => ['required', 'string', 'max:255'],
            'resource_type' => ['nullable', 'string', 'in:image,video,raw'],
        ]);

        $mimeType = $request->input('mime_type');
        $size = (int) $request->input('size');
        $originalName = $request->input('original_name');
        $resourceType = $request->input('resource_type');

        if ($resourceType === null) {
            $resourceType = match (true) {
                str_starts_with($mimeType, 'image/') => 'image',
                str_starts_with($mimeType, 'video/'), str_starts_with($mimeType, 'audio/') => 'video',
                default => 'raw',
            };
        }

        if ($resourceType === 'image' && ! str_starts_with($mimeType, 'image/')) {
            return response()->json([
                'message' => "Invalid mime type [{$mimeType}] for image resource.",
            ], 415);
        }

        if ($resourceType === 'video' && ! str_starts_with($mimeType, 'video/') && ! str_starts_with($mimeType, 'audio/')) {
            return response()->json([
                'message' => "Invalid mime type [{$mimeType}] for video resource.",
            ], 415);
        }

        $maxSize = config('media.cloudinary.max_file_size', 1073741824);

        if ($size > $maxSize) {
            return response()->json([
                'message' => 'File too large. Maximum size is '.($maxSize / 1073741824).'GB.',
            ], 413);
        }

        $media = $this->uploadService->createPendingMedia($mimeType, $size, $originalName, $resourceType);

        $signed = $this->uploadService->generateSignedUpload($media, $resourceType);

        return response()->json([
            'data' => [
                'url' => $signed->url,
                'public_id' => $signed->publicId,
                'folder' => $signed->folder,
                'signature' => $signed->signature,
                'timestamp' => $signed->timestamp,
                'upload_preset' => $signed->uploadPreset,
                'api_key' => $signed->apiKey,
                'media_uuid' => $signed->mediaUuid,
                'media_id' => $signed->mediaId,
                'eager' => $signed->eager,
                'eager_notification_url' => $signed->eager_notification_url,
            ],
        ]);
    }
}
