<?php

namespace App\Jobs;

use App\Media\Enums\ProcessingState;
use App\Media\Repositories\MediaRepository;
use App\Models\Media;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CheckMediaProcessingTimeout implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Media $media,
    ) {}

    public function handle(MediaRepository $repository): void
    {
        $media = $this->media->fresh();

        if (! $media || $media->status !== ProcessingState::Processing->value) {
            return;
        }

        $repository->update($media, [
            'status' => ProcessingState::Ready->value,
            'processing_completed_at' => now(),
        ]);

        $media->refresh();

        Log::warning('Media processing timed out, transitioned to ready', [
            'media_id' => $media->id,
            'public_id' => $media->cloudinary_public_id,
        ]);
    }
}
