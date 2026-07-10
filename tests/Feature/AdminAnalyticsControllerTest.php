<?php

use App\Models\MediaView;
use App\Models\Story;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_admin' => true]);
    $this->actingAs($this->admin);

    $story = Story::factory()->create(['title' => 'Test Story', 'type' => 'photo']);
    MediaView::create(['story_id' => $story->id, 'watch_time' => 30, 'completed' => false]);
});

test('data endpoint returns analytics data for overview tab', function () {
    $response = $this->getJson(route('admin.analytics.data', [
        'tab' => 'overview',
        'start' => now()->subDays(30)->toDateString(),
        'end' => now()->toDateString(),
    ]));

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => [
                'media' => ['total_views', 'unique_viewers', 'uploads'],
                'user_stats' => ['new_users', 'total_users'],
                'room_stats' => ['total_rooms'],
                'realtime',
            ],
            'period',
        ]);
});

test('data endpoint returns media tab data', function () {
    $response = $this->getJson(route('admin.analytics.data', [
        'tab' => 'media',
        'start' => now()->subDays(30)->toDateString(),
        'end' => now()->toDateString(),
    ]));

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => ['total_views', 'unique_viewers', 'top_stories'],
        ]);
});

test('data endpoint returns users tab data', function () {
    $response = $this->getJson(route('admin.analytics.data', [
        'tab' => 'users',
        'start' => now()->subDays(30)->toDateString(),
        'end' => now()->toDateString(),
    ]));

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => ['new_users', 'total_users', 'active_users'],
        ]);
});

test('data endpoint returns processing tab data', function () {
    $response = $this->getJson(route('admin.analytics.data', [
        'tab' => 'processing',
        'start' => now()->subDays(30)->toDateString(),
        'end' => now()->toDateString(),
    ]));

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => ['total_jobs', 'success_rate', 'recent_failures'],
        ]);
});

test('realtime endpoint returns current stats', function () {
    $response = $this->getJson(route('admin.analytics.realtime'));

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => ['active_sessions', 'views_today', 'uploads_today', 'users_today', 'processing_now'],
        ]);
});

test('data endpoint requires admin', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $this->actingAs($user);

    $response = $this->getJson(route('admin.analytics.data'));

    $response->assertForbidden();
});

test('export endpoint returns csv file', function () {
    $response = $this->get(route('admin.analytics.export', [
        'tab' => 'overview',
        'format' => 'csv',
        'start' => now()->subDays(30)->toDateString(),
        'end' => now()->toDateString(),
    ]));

    $response->assertSuccessful();
});

test('data endpoint validates date range', function () {
    $response = $this->getJson(route('admin.analytics.data', [
        'start' => now()->toDateString(),
        'end' => now()->subDays(30)->toDateString(),
    ]));

    $response->assertStatus(422);
});
