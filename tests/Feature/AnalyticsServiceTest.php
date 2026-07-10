<?php

use App\Media\Enums\ProcessingState;
use App\Models\Media;
use App\Models\Story;
use App\Models\User;
use App\Services\AnalyticsService;

beforeEach(function () {
    $this->service = app(AnalyticsService::class);
});

test('track creates a media event', function () {
    $event = $this->service->track('test.event');

    expect($event)->not->toBeNull()
        ->and($event->event_name)->toBe('test.event');
});

test('track with media sets eventable context', function () {
    $media = Media::factory()->create();

    $event = $this->service->track('media.upload', media: $media);

    expect($event->eventable_id)->toBe($media->id)
        ->and($event->eventable_type)->toBe(Media::class);
});

test('track with story sets story and room context', function () {
    $story = Story::factory()->create(['title' => 'Test', 'type' => 'photo']);

    $event = $this->service->track('story.created', story: $story);

    expect($event->story_id)->toBe($story->id)
        ->and($event->room_id)->toBe($story->room_id);
});

test('recordView creates a media view', function () {
    $story = Story::factory()->create(['title' => 'Test', 'type' => 'photo']);

    $view = $this->service->recordView($story, [
        'watch_time' => 120,
        'completed' => true,
    ]);

    expect($view)->not->toBeNull()
        ->and($view->story_id)->toBe($story->id)
        ->and($view->watch_time)->toBe(120)
        ->and($view->completed)->toBeTrue();
});

test('startSession creates a media session', function () {
    $user = User::factory()->create();

    $session = $this->service->startSession(
        sessionId: 'test-session-123',
        user: $user,
    );

    expect($session)->not->toBeNull()
        ->and($session->session_id)->toBe('test-session-123')
        ->and($session->user_id)->toBe($user->id);
});

test('logProcessing creates a processing log', function () {
    $media = Media::factory()->create();

    $log = $this->service->logProcessing(
        media: $media,
        fromState: ProcessingState::Uploading,
        toState: ProcessingState::Processing,
    );

    expect($log)->not->toBeNull()
        ->and($log->media_id)->toBe($media->id)
        ->and($log->from_state)->toBe('uploading')
        ->and($log->to_state)->toBe('processing');
});

test('logProcessing with exception', function () {
    $media = Media::factory()->create();

    $log = $this->service->logProcessing(
        media: $media,
        fromState: ProcessingState::Processing,
        toState: ProcessingState::Failed,
        exception: 'Upload failed: connection timeout',
    );

    expect($log->to_state)->toBe('failed')
        ->and($log->exception)->toBe('Upload failed: connection timeout');
});

test('hashIp returns consistent hash', function () {
    $reflection = new ReflectionMethod($this->service, 'hashIp');
    $reflection->setAccessible(true);

    $hash1 = $reflection->invoke($this->service, '192.168.1.1');
    $hash2 = $reflection->invoke($this->service, '192.168.1.1');
    $hash3 = $reflection->invoke($this->service, '10.0.0.1');

    expect($hash1)->not->toBeNull()
        ->and($hash1)->toBe($hash2)
        ->and($hash1)->not->toBe($hash3);
});

test('hashIp returns null for null input', function () {
    $reflection = new ReflectionMethod($this->service, 'hashIp');
    $reflection->setAccessible(true);

    expect($reflection->invoke($this->service, null))->toBeNull();
});
