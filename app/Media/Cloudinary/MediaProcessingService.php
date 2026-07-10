<?php

namespace App\Media\Cloudinary;

use App\Media\Enums\ProcessingState;
use App\Media\Exceptions\MediaProcessingException;
use App\Media\Repositories\MediaRepository;
use App\Models\Media;

class MediaProcessingService
{
    public function __construct(
        protected MediaRepository $repository,
    ) {}

    public function transition(Media $media, ProcessingState $newState, ?string $reason = null): Media
    {
        $currentState = ProcessingState::tryFrom($media->status ?? 'uploading') ?? ProcessingState::Uploading;

        if (! ProcessingState::validTransitions($currentState, $newState)) {
            throw new MediaProcessingException(
                "Cannot transition media [{$media->id}] from [{$currentState->value}] to [{$newState->value}]."
            );
        }

        $data = ['status' => $newState->value];

        if ($newState === ProcessingState::Processing) {
            $data['processing_started_at'] = now();
        }

        if ($newState === ProcessingState::Ready) {
            $data['processing_completed_at'] = now();
        }

        if ($newState === ProcessingState::Failed && $reason !== null) {
            $data['failed_reason'] = $reason;
        }

        $this->repository->update($media, $data);

        $media->refresh();

        return $media;
    }

    public function markUploading(Media $media): Media
    {
        return $this->transition($media, ProcessingState::Uploading);
    }

    public function markProcessing(Media $media): Media
    {
        return $this->transition($media, ProcessingState::Processing);
    }

    public function markReady(Media $media): Media
    {
        return $this->transition($media, ProcessingState::Ready);
    }

    public function markFailed(Media $media, string $reason): Media
    {
        return $this->transition($media, ProcessingState::Failed, $reason);
    }

    public function markDeleted(Media $media): Media
    {
        return $this->transition($media, ProcessingState::Deleted);
    }
}
