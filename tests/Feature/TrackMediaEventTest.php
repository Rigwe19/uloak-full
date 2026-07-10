<?php

use App\Events\MediaDeleted;
use App\Events\MediaProcessingCompleted;
use App\Events\MediaProcessingFailed;
use App\Events\MediaProcessingStarted;
use App\Listeners\TrackMediaEvent;
use App\Models\Media;
use App\Models\MediaEvent;
use App\Models\ProcessingLog;

beforeEach(function () {
    $this->media = Media::factory()->create();
    $this->listener = app(TrackMediaEvent::class);
});

test('handleProcessingStarted creates event and processing log', function () {
    $event = new MediaProcessingStarted($this->media);

    $this->listener->handleProcessingStarted($event);

    expect(MediaEvent::where('event_name', 'processing.started')->count())->toBe(1)
        ->and(ProcessingLog::where('to_state', 'processing')->count())->toBe(1);
});

test('handleProcessingCompleted creates event and processing log', function () {
    $event = new MediaProcessingCompleted($this->media);

    $this->listener->handleProcessingCompleted($event);

    expect(MediaEvent::where('event_name', 'processing.completed')->count())->toBe(1)
        ->and(ProcessingLog::where('to_state', 'ready')->count())->toBe(1);
});

test('handleProcessingFailed creates event and processing log with exception', function () {
    $event = new MediaProcessingFailed($this->media, 'Upload failed');

    $this->listener->handleProcessingFailed($event);

    expect(MediaEvent::where('event_name', 'processing.failed')->count())->toBe(1)
        ->and(ProcessingLog::where('to_state', 'failed')->count())->toBe(1)
        ->and(ProcessingLog::where('exception', 'Upload failed')->count())->toBe(1);
});

test('handleMediaDeleted creates event', function () {
    $event = new MediaDeleted($this->media);

    $this->listener->handleMediaDeleted($event);

    expect(MediaEvent::where('event_name', 'deleted')->count())->toBe(1);
});

test('multiple events create separate records', function () {
    $this->listener->handleProcessingStarted(new MediaProcessingStarted($this->media));
    $this->listener->handleProcessingCompleted(new MediaProcessingCompleted($this->media));

    expect(MediaEvent::count())->toBe(2)
        ->and(ProcessingLog::count())->toBe(2);
});
