<?php

namespace App\Media\Cloudinary;

use App\Events\MediaProcessingCompleted;
use App\Events\MediaProcessingFailed;
use App\Media\Enums\ProcessingState;
use App\Media\Exceptions\MediaProcessingException;
use App\Models\Media;

class MediaProcessingService
{
    public function markProcessing(Media $media): Media
    {
        $from = ProcessingState::tryFrom($media->status) ?? ProcessingState::Uploading;
        $to = ProcessingState::Processing;

        if (! ProcessingState::validTransitions($from, $to)) {
            throw new MediaProcessingException("Invalid transition from {$from->value} to {$to->value}");
        }

        $media->status = $to->value;
        $media->processing_started_at = now();
        $media->save();
        $media->refresh();

        return $media;
    }

    public function markReady(Media $media): Media
    {
        $from = ProcessingState::tryFrom($media->status) ?? ProcessingState::Processing;
        $to = ProcessingState::Ready;

        if (! ProcessingState::validTransitions($from, $to)) {
            throw new MediaProcessingException("Invalid transition from {$from->value} to {$to->value}");
        }

        $media->status = $to->value;
        $media->processing_completed_at = now();
        $media->save();
        $media->refresh();

        MediaProcessingCompleted::dispatch($media);

        return $media;
    }

    public function markFailed(Media $media, string $reason): Media
    {
        $from = ProcessingState::tryFrom($media->status);
        // Allow failure from uploading or processing; if unknown, allow
        if ($from !== null) {
            $to = ProcessingState::Failed;
            if (! ProcessingState::validTransitions($from, $to)) {
                // Allow from uploading/processing only; otherwise force
                // But test expects uploading -> failed is valid, so we enforce
                throw new MediaProcessingException("Invalid transition from {$from->value} to {$to->value}");
            }
        }

        $media->status = ProcessingState::Failed->value;
        $media->failed_reason = $reason;
        $media->save();
        $media->refresh();

        MediaProcessingFailed::dispatch($media, $reason);

        return $media;
    }
}
