<?php

use App\Models\Media;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->room = Room::factory()->create(['created_by' => $this->user->id]);
});

test('video upload creates media in processing state', function () {
    $this->actingAs($this->user);

    $response = $this->post('/api/media/upload', [
        'file' => UploadedFile::fake()->create('test.mp4', 1024, 'video/mp4'),
        'type' => 'video',
    ]);

    $response->assertOk();

    $media = Media::where('original_name', 'test.mp4')->first();
    expect($media)->not->toBeNull();
    expect($media->status)->toBe('processing');
    expect($media->processing_started_at)->not->toBeNull();
});

test('processed video transitions to ready state', function () {
    $this->actingAs($this->user);

    $response = $this->post('/api/media/upload', [
        'file' => UploadedFile::fake()->create('test.mp4', 1024, 'video/mp4'),
        'type' => 'video',
    ]);

    $response->assertOk();

    $media = Media::where('original_name', 'test.mp4')->first();
    expect($media)->not->toBeNull();

    // Simulate processing completion
    $media->update([
        'status' => 'ready',
        'url' => 'https://example.com/videos/test.mp4',
        'thumbnail_url' => 'https://example.com/thumbnails/test.jpg',
    ]);

    $media->refresh();
    expect($media->status)->toBe('ready');
    expect($media->url)->not->toBeNull();
    expect($media->thumbnail_url)->not->toBeNull();
});

test('failed video processing sets failed status', function () {
    $this->actingAs($this->user);

    $response = $this->post('/api/media/upload', [
        'file' => UploadedFile::fake()->create('test.mp4', 1024, 'video/mp4'),
        'type' => 'video',
    ]);

    $response->assertOk();

    $media = Media::where('original_name', 'test.mp4')->first();
    expect($media)->not->toBeNull();

    // Simulate processing failure
    $media->update([
        'status' => 'failed',
        'failed_reason' => 'FFmpeg processing failed: Invalid codec',
    ]);

    $media->refresh();
    expect($media->status)->toBe('failed');
    expect($media->failed_reason)->not->toBeNull();
});
