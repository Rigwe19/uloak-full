<?php

use App\Media\Enums\ProcessingState;
use App\Models\Media;
use App\Models\MediaView;
use App\Models\ProcessingLog;
use App\Models\Story;
use App\Models\User;
use App\Services\AnalyticsAggregationService;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->service = app(AnalyticsAggregationService::class);
    $this->start = CarbonImmutable::now()->subDays(30);
    $this->end = CarbonImmutable::now();
});

test('mediaStats returns empty defaults with no data', function () {
    $stats = $this->service->mediaStats($this->start, $this->end);

    expect($stats['total_views'])->toBe(0)
        ->and($stats['unique_viewers'])->toBe(0)
        ->and($stats['total_watch_time'])->toBe(0)
        ->and($stats['uploads'])->toBe(0)
        ->and($stats['completion_rate'])->toBe(0);
});

test('mediaStats counts views and watch time', function () {
    $story = Story::factory()->create(['title' => 'Test', 'type' => 'photo']);

    foreach (range(1, 3) as $i) {
        MediaView::create([
            'story_id' => $story->id,
            'watch_time' => 60,
            'completed' => true,
        ]);
    }

    $stats = $this->service->mediaStats($this->start, $this->end);

    expect($stats['total_views'])->toBe(3)
        ->and($stats['total_watch_time'])->toBe(180)
        ->and($stats['completed_views'])->toBe(3)
        ->and($stats['completion_rate'])->toBe(100.0);
});

test('userStats returns empty defaults with no data', function () {
    $stats = $this->service->userStats($this->start, $this->end);

    expect($stats['new_users'])->toBe(0)
        ->and($stats['active_users'])->toBe(0)
        ->and($stats['sessions'])->toBe(0);
});

test('userStats counts new users', function () {
    User::factory()->count(5)->create();

    $stats = $this->service->userStats($this->start, $this->end);

    expect($stats['new_users'])->toBe(5)
        ->and($stats['total_users'])->toBe(5);
});

test('processingHealth returns empty defaults with no data', function () {
    $health = $this->service->processingHealth($this->start, $this->end);

    expect($health['total_jobs'])->toBe(0)
        ->and($health['successful'])->toBe(0)
        ->and($health['failed'])->toBe(0)
        ->and($health['success_rate'])->toBe(0);
});

test('processingHealth calculates success rate', function () {
    $media = Media::factory()->create();

    foreach (range(1, 8) as $i) {
        ProcessingLog::create([
            'media_id' => $media->id,
            'media_uuid' => $media->uuid,
            'to_state' => ProcessingState::Ready->value,
            'duration_ms' => 1000,
        ]);
    }

    foreach (range(1, 2) as $i) {
        ProcessingLog::create([
            'media_id' => $media->id,
            'media_uuid' => $media->uuid,
            'to_state' => ProcessingState::Failed->value,
            'exception' => 'Test error',
        ]);
    }

    $health = $this->service->processingHealth($this->start, $this->end);

    expect($health['total_jobs'])->toBe(10)
        ->and($health['successful'])->toBe(8)
        ->and($health['failed'])->toBe(2)
        ->and($health['success_rate'])->toBe(80.0);
});

test('realTimeStats returns current counts', function () {
    $stats = $this->service->realTimeStats();

    expect($stats)->toHaveKeys([
        'active_sessions', 'views_today', 'uploads_today',
        'users_today', 'processing_now',
    ]);
});

test('roomStats returns empty defaults with no data', function () {
    $stats = $this->service->roomStats($this->start, $this->end);

    expect($stats['total_rooms'])->toBe(0)
        ->and($stats['new_rooms'])->toBe(0)
        ->and($stats['active_rooms'])->toBe(0);
});

test('creatorStats returns empty defaults with no stories', function () {
    $user = User::factory()->create();

    $stats = $this->service->creatorStats($user, $this->start, $this->end);

    expect($stats['total_stories'])->toBe(0)
        ->and($stats['total_views'])->toBe(0)
        ->and($stats['total_comments'])->toBe(0);
});
