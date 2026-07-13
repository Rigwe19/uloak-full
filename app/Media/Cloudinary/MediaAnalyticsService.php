<?php

namespace App\Media\Cloudinary;

use App\Models\Media;
use Illuminate\Support\Facades\Log;

class MediaAnalyticsService
{
    protected string $requestId;

    public function __construct()
    {
        $this->requestId = str()->uuid();
    }

    public function uploadStarted(Media $media): void
    {
        Log::info('Upload started', $this->context($media, [
            'size' => $media->size,
            'mime_type' => $media->mime_type,
        ]));
    }

    public function uploadCompleted(Media $media): void
    {
        Log::info('Upload completed', $this->context($media, [
            'duration' => $media->processing_started_at
                ? $media->created_at->diffInSeconds($media->processing_started_at)
                : null,
        ]));
    }

    public function uploadFailed(Media $media, string $reason): void
    {
        Log::error('Upload failed', $this->context($media, [
            'reason' => $reason,
        ]));
    }

    public function processingStarted(Media $media): void
    {
        Log::info('Processing started', $this->context($media));
    }

    public function processingCompleted(Media $media): void
    {
        Log::info('Processing completed', $this->context($media, [
            'processing_duration' => $media->processing_started_at && $media->processing_completed_at
                ? $media->processing_started_at->diffInSeconds($media->processing_completed_at)
                : null,
            'file_size' => $media->size,
            'duration' => $media->duration,
            'width' => $media->width,
            'height' => $media->height,
        ]));
    }

    public function processingFailed(Media $media, string $reason): void
    {
        Log::error('Processing failed', $this->context($media, [
            'reason' => $reason,
            'retry_count' => $media->retry_count,
        ]));
    }

    public function webhookReceived(array $payload): void
    {
        Log::info('Webhook received', [
            'request_id' => $this->requestId,
            'public_id' => $payload['public_id'] ?? null,
            'notification_type' => $payload['notification_type'] ?? 'unknown',
            'payload' => $payload,
        ]);
    }

    public function webhookProcessed(Media $media): void
    {
        Log::info('Webhook processed', $this->context($media, [
            'cloudinary_public_id' => $media->cloudinary_public_id,
        ]));
    }

    public function webhookFailed(string $publicId, string $reason): void
    {
        Log::error('Webhook failed', [
            'request_id' => $this->requestId,
            'public_id' => $publicId,
            'reason' => $reason,
        ]);
    }

    protected function context(Media $media, array $extra = []): array
    {
        return array_merge([
            'request_id' => $this->requestId,
            'media_id' => $media->id,
            'media_uuid' => $media->uuid,
            'cloudinary_public_id' => $media->cloudinary_public_id,
        ], $extra);
    }
}
