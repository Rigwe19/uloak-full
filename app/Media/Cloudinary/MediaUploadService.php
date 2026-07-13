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
        return $this->createPendingMedia($mimeType, $size, $originalName, 'video');
    }

    public function createPendingMedia(string $mimeType, int $size, string $originalName, string $resourceType): Media
    {
        $uuid = (string) Str::uuid();
        $typeLabel = $resourceType === 'raw' ? 'document' : $resourceType;
        $publicId = 'story_'.$typeLabel.'_'.now()->format('Ymd_His').'_'.substr($uuid, 0, 8);

        $mediaType = match ($resourceType) {
            'image' => MediaType::Image,
            'video' => (str_starts_with($mimeType, 'audio/') ? MediaType::Audio : MediaType::Video),
            'raw' => MediaType::Document,
            default => MediaType::Video,
        };

        return $this->repository->create([
            'uuid' => $uuid,
            'filename' => $publicId,
            'original_name' => $originalName,
            'mime_type' => $mimeType,
            'extension' => pathinfo($originalName, PATHINFO_EXTENSION) ?: 'bin',
            'size' => $size,
            'disk' => 'cloudinary',
            'path' => $publicId,
            'type' => $mediaType->value,
            'status' => ProcessingState::Uploading->value,
            'provider' => 'cloudinary',
            'cloudinary_public_id' => $publicId,
        ]);
    }

    public function generateSignedUpload(Media $media, string $resourceType = 'video'): SignedUploadDTO
    {
        $timestamp = now()->timestamp;
        $publicId = $media->cloudinary_public_id;
        $typeLabel = $resourceType === 'raw' ? 'document' : $resourceType;
        $folder = 'stories/'.$typeLabel.'s/'.$media->id.'/'.now()->format('Y/m');

        $params = [
            'public_id' => $publicId,
            'folder' => $folder,
            'timestamp' => $timestamp,
            'upload_preset' => $this->cloudinary->uploadPreset(),
        ];

        if ($resourceType === 'video') {
            $params['eager'] = $this->cloudinary->buildVideoEagerTransformations();
            $params['eager_async'] = true;
            $params['eager_notification_url'] = $this->notificationUrl();
        } elseif ($resourceType === 'image') {
            $params['eager'] = $this->cloudinary->buildImageEagerTransformations();
            $params['eager_async'] = true;
            $params['eager_notification_url'] = $this->notificationUrl();
        }

        $signature = $this->cloudinary->generateSignature($params, $timestamp);

        $fullPublicId = $folder.'/'.$publicId;

        $this->repository->update($media, [
            'path' => $fullPublicId,
            'cloudinary_public_id' => $fullPublicId,
        ]);

        return new SignedUploadDTO(
            url: $this->cloudinary->uploadUrl($resourceType),
            signature: $signature,
            timestamp: $timestamp,
            publicId: $publicId,
            folder: $folder,
            uploadPreset: $this->cloudinary->uploadPreset(),
            apiKey: $this->cloudinary->apiKey(),
            mediaId: $media->id,
            mediaUuid: $media->uuid,
            eager: $params['eager'] ?? '',
            eager_notification_url: $params['eager_notification_url'] ?? '',
        );
    }

    protected function notificationUrl(): string
    {
        return config('app.url').'/api/webhooks/cloudinary';
    }
}
