<?php

namespace App\Media\Cloudinary;

use App\Media\DTOs\SignedUploadDTO;
use App\Media\Enums\MediaType;
use App\Media\Enums\ProcessingState;
use App\Media\Repositories\MediaRepository;
use App\Models\Media;
use Illuminate\Support\Str;

class MediaUploadService
{
    public function __construct(
        protected MediaRepository $repository,
        protected CloudinaryService $cloudinary,
    ) {}

    public function createPendingVideo(string $mimeType, int $size, string $originalName): Media
    {
        $uuid = (string) Str::uuid();
        $publicId = 'story_video_'.now()->format('Ymd_His').'_'.substr($uuid, 0, 8);

        return $this->repository->create([
            'uuid' => $uuid,
            'filename' => $publicId,
            'original_name' => $originalName,
            'mime_type' => $mimeType,
            'extension' => pathinfo($originalName, PATHINFO_EXTENSION) ?: 'mp4',
            'size' => $size,
            'disk' => 'cloudinary',
            'path' => $publicId,
            'type' => MediaType::Video->value,
            'status' => ProcessingState::Uploading->value,
            'provider' => 'cloudinary',
            'cloudinary_public_id' => $publicId,
        ]);
    }

    public function generateSignedUpload(Media $media): SignedUploadDTO
    {
        $timestamp = now()->timestamp;
        $publicId = $media->cloudinary_public_id;
        $folder = 'stories/videos/'.$media->id.'/'.now()->format('Y/m');

        $params = [
            'public_id' => $publicId,
            'folder' => $folder,
            'timestamp' => $timestamp,
            'upload_preset' => $this->cloudinary->uploadPreset(),
            'eager' => $this->cloudinary->buildEagerTransformations(),
            'eager_async' => true,
            'eager_notification_url' => $this->notificationUrl(),
        ];

        $signature = $this->cloudinary->generateSignature($params, $timestamp);

        $this->repository->update($media, [
            'path' => $folder.'/'.$publicId,
        ]);

        return new SignedUploadDTO(
            url: $this->cloudinary->uploadUrl(),
            signature: $signature,
            timestamp: $timestamp,
            publicId: $publicId,
            folder: $folder,
            uploadPreset: $this->cloudinary->uploadPreset(),
            apiKey: $this->cloudinary->apiKey(),
            mediaId: $media->id,
            mediaUuid: $media->uuid,
            eager: $params['eager'],
            eager_notification_url: $params['eager_notification_url']
        );
    }

    protected function notificationUrl(): string
    {
        return config('app.url').'/api/webhooks/cloudinary';
    }
}
