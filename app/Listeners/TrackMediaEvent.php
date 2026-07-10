<?php

namespace App\Listeners;

use App\Events\MediaDeleted;
use App\Events\MediaProcessingCompleted;
use App\Events\MediaProcessingFailed;
use App\Events\MediaProcessingStarted;
use App\Media\Enums\ProcessingState;
use App\Services\AnalyticsService;
use Illuminate\Events\Dispatcher;

class TrackMediaEvent
{
    public function __construct(protected AnalyticsService $analytics) {}

    public function handleProcessingStarted(MediaProcessingStarted $event): void
    {
        $this->analytics->track('processing.started', $event->media);
        $this->analytics->logProcessing(
            $event->media,
            fromState: ProcessingState::Uploading,
            toState: ProcessingState::Processing,
        );
    }

    public function handleProcessingCompleted(MediaProcessingCompleted $event): void
    {
        $this->analytics->track('processing.completed', $event->media);
        $this->analytics->logProcessing(
            $event->media,
            fromState: ProcessingState::Processing,
            toState: ProcessingState::Ready,
        );
    }

    public function handleProcessingFailed(MediaProcessingFailed $event): void
    {
        $this->analytics->track('processing.failed', $event->media, properties: [
            'metadata' => ['error' => $event->reason],
        ]);
        $this->analytics->logProcessing(
            $event->media,
            fromState: ProcessingState::Processing,
            toState: ProcessingState::Failed,
            exception: $event->reason,
        );
    }

    public function handleMediaDeleted(MediaDeleted $event): void
    {
        $this->analytics->track('deleted', $event->media);
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            MediaProcessingStarted::class,
            [$this, 'handleProcessingStarted'],
        );
        $events->listen(
            MediaProcessingCompleted::class,
            [$this, 'handleProcessingCompleted'],
        );
        $events->listen(
            MediaProcessingFailed::class,
            [$this, 'handleProcessingFailed'],
        );
        $events->listen(
            MediaDeleted::class,
            [$this, 'handleMediaDeleted'],
        );
    }
}
