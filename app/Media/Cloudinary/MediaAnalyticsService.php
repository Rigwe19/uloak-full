<?php

namespace App\Media\Cloudinary;

use App\Models\Media;
use Illuminate\Support\Facades\Log;

class MediaAnalyticsService
{
    public function uploadStarted(Media $media): void
    {
        Log::info('media upload started', ['media_id' => $media->id, 'uuid' => $media->uuid]);
    }

    public function uploadCompleted(Media $media): void
    {
        Log::info('media upload completed', ['media_id' => $media->id, 'uuid' => $media->uuid]);
    }

    public function processingStarted(Media $media): void
    {
        Log::info('media processing started', ['media_id' => $media->id, 'uuid' => $media->uuid]);
    }

    public function processingCompleted(Media $media): void
    {
        Log::info('media processing completed', ['media_id' => $media->id, 'uuid' => $media->uuid]);
    }

    public function processingFailed(Media $media, string $reason): void
    {
        Log::error('media processing failed', ['media_id' => $media->id, 'uuid' => $media->uuid, 'reason' => $reason]);
    }
}
