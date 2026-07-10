<?php

namespace App\Media\Cloudinary;

use App\Events\MediaProcessingCompleted;
use App\Events\MediaProcessingFailed;
use App\Media\Enums\ProcessingState;
use App\Media\Exceptions\MediaProcessingException;
use App\Media\Repositories\MediaRepository;
use App\Models\Media;
use Illuminate\Support\Facades\Log;

class MediaWebhookService
{
    public function __construct(
        protected MediaRepository $repository,
        protected CloudinaryService $cloudinary,
    ) {}

    public function verify(string $payload, string $signature, int|string|null $timestamp = null): bool
    {
        return $this->cloudinary->verifyWebhookSignature($payload, $signature, $timestamp);
    }

    public function handle(array $payload, ?string $signature = null): Media
    {
        $publicId = $payload['public_id'] ?? '';

        if ($publicId === '') {
            throw new MediaProcessingException('Webhook payload missing public_id.');
        }

        $media = $this->repository->findByCloudinaryPublicId($publicId);

        if (! $media) {
            throw new MediaProcessingException("No media found for Cloudinary public_id [{$publicId}].");
        }

        $notificationType = $payload['notification_type'] ?? '';

        if ($notificationType === 'eager') {
            return $this->handleEager($media, $payload);
        }

        if (($payload['status'] ?? '') === 'error') {
            return $this->handleFailure($media, $payload);
        }

        return $this->handleSuccess($media, $payload);
    }

    protected function handleSuccess(Media $media, array $payload): Media
    {

        $updateData = [
            'status' => 'processing',
            'width' => $payload['width'] ?? $media->width,
            'height' => $payload['height'] ?? $media->height,
            'size' => $payload['bytes'] ?? $media->size,
            'provider_id' => $payload['asset_id'] ?? null,
            'path' => $payload['secure_url'] ?? $media->path,
        ];

        $metadata = array_merge($media->metadata ?? [], [
            'cloudinary_asset_id' => $payload['asset_id'] ?? null,
            'cloudinary_format' => $payload['format'] ?? null,
            'cloudinary_version' => $payload['version'] ?? null,
            'cloudinary_type' => $payload['resource_type'] ?? null,
            'cloudinary_created_at' => $payload['created_at'] ?? null,
            'tags' => $payload['tags'] ?? [],
            'signature' => $payload['signature'] ?? null,
            'width' => $payload['width'] ?? null,
            'height' => $payload['height'] ?? null,
            'duration' => $payload['duration'] ?? null,
            'bitrate' => $payload['bit_rate'] ?? null,
            'video_codec' => $payload['video']['codec'] ?? null,
            'audio_codec' => $payload['audio']['codec'] ?? null,
            'frame_rate' => $payload['frame_rate'] ?? null,
            'pixel_format' => $payload['pix_format'] ?? null,
            'is_audio' => $payload['is_audio'] ?? null,
            'video_metadata' => [
                'width' => $payload['width'] ?? null,
                'height' => $payload['height'] ?? null,
                'format' => $payload['format'] ?? null,
                'resource_type' => $payload['resource_type'] ?? null,
                'frame_rate' => $payload['frame_rate'] ?? null,
                'bit_rate' => $payload['tags'] ?? null,
                'duration' => $payload['pages'] ?? null,
                'bytes' => $payload['bytes'] ?? null,
            ],
        ]);

        if (isset($payload['duration'])) {
            $updateData['duration'] = (float) $payload['duration'];
        }

        if (isset($payload['width'], $payload['height']) && $payload['height'] > 0) {
            $updateData['aspect_ratio'] = round($payload['width'] / $payload['height'], 4);
        }

        if (isset($payload['eager'])) {
            foreach ($payload['eager'] as $eager) {
                $transformation = $eager['transformation'] ?? '';

                if (str_contains($transformation, 'sprit')) {
                    $updateData['sprite'] = [
                        'url' => $eager['secure_url'],
                        'frame_width' => $eager['width'] ?? 160,
                        'frame_height' => $eager['height'] ?? 90,
                        'columns' => $eager['sprite_image_count'] ?? 10,
                        'rows' => 1,
                    ];
                } elseif (str_contains($transformation, 'so_')) {
                    $updateData['preview'] = $eager['secure_url'];
                } elseif ($updateData['thumbnail'] ?? null === null) {
                    $updateData['thumbnail'] = $eager['secure_url'];
                }
            }
        }

        $updateData['metadata'] = array_merge($media->metadata ?? [], $metadata);

        $this->repository->update($media, $updateData);

        $media->refresh();

        MediaProcessingCompleted::dispatch($media);

        Log::info('Cloudinary webhook processed', [
            'media_id' => $media->id,
            'public_id' => $media->cloudinary_public_id,
        ]);

        return $media;
    }

    protected function handleEager(Media $media, array $payload): Media
    {
        $update = [
            'status' => ProcessingState::Ready->value,
            'processing_completed_at' => now(),
        ];

        $metadata = $media->metadata ?? [];

        foreach ($payload['eager'] ?? [] as $item) {
            $transformation = $item['transformation'] ?? '';
            logger()->info('transformation', ['transformation' => $transformation]);
            if (
                str_contains($transformation, 'w_auto') &&
                str_contains($transformation, 'q_auto')
            ) {
                $metadata['preview'] = [
                    'url' => $item['secure_url'],
                    'width' => $item['width'],
                    'height' => $item['height'],
                    'bytes' => $item['bytes'],
                ];

                continue;
            }

            if (
                str_contains($transformation, 'w_640') &&
                str_contains($transformation, 'h_360') &&
                str_contains($transformation, 'f_auto')
            ) {
                $metadata['mobile_video'] = [
                    'url' => $item['secure_url'],
                    'width' => $item['width'],
                    'height' => $item['height'],
                    'bytes' => $item['bytes'],
                ];

                continue;
            }

            if (str_contains($transformation, 'so_3')) {
                $update['thumbnail'] = $item['secure_url'];

                continue;
            }

            if (str_contains($transformation, 'fl_sprite')) {
                $update['sprite'] = [
                    'vtt' => $item['secure_url'],
                    'image' => str_replace('.vtt', '.jpg', $item['secure_url']),
                ];
            }
        }

        $update['metadata'] = $metadata;
        $this->repository->update($media, $update);
        $media->refresh();

        MediaProcessingCompleted::dispatch($media);

        return $media;
    }

    protected function handleFailure(Media $media, array $payload): Media
    {
        $error = $payload['error']['message'] ?? ($payload['status'] ?? 'Unknown error');

        $this->repository->update($media, [
            'status' => ProcessingState::Failed->value,
            'failed_reason' => $error,
            'metadata' => array_merge($media->metadata ?? [], [
                'cloudinary_error' => $payload['error'] ?? null,
                'cloudinary_failed_at' => now()->toIso8601String(),
            ]),
        ]);

        $media->refresh();

        MediaProcessingFailed::dispatch($media, $error);

        Log::error('Cloudinary processing failed', [
            'media_id' => $media->id,
            'public_id' => $media->cloudinary_public_id,
            'error' => $error,
        ]);

        return $media;
    }
}
