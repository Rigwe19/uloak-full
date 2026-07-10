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
        $request->validate([
            'mime_type' => ['required', 'string', 'max:255'],
            'size' => ['required', 'integer', 'min:1', 'max:1073741824'],
            'original_name' => ['required', 'string', 'max:255'],
        ]);

        $mimeType = $request->input('mime_type');
        $size = (int) $request->input('size');
        $originalName = $request->input('original_name');

        $allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'application/mp4'];

        if (! in_array($mimeType, $allowedMimes, true)) {
            return response()->json([
                'message' => "Unsupported format: {$mimeType}.",
            ], 415);
        }

        $maxSize = config('media.cloudinary.max_file_size', 1073741824);

        if ($size > $maxSize) {
            return response()->json([
                'message' => 'File too large. Maximum size is '.($maxSize / 1073741824).'GB.',
            ], 413);
        }

        $media = $this->uploadService->createPendingVideo($mimeType, $size, $originalName);

        $signed = $this->uploadService->generateSignedUpload($media);

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
