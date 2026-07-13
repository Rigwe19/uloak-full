<?php

use App\Events\MediaDeleted;
use App\Events\MediaProcessingCompleted;
use App\Events\MediaProcessingFailed;
use App\Media\Cloudinary\CloudinaryService;
use App\Media\Cloudinary\CloudinaryVideoProcessor;
use App\Media\Cloudinary\MediaAnalyticsService;
use App\Media\Cloudinary\MediaProcessingService;
use App\Media\Cloudinary\MediaUploadService;
use App\Media\Cloudinary\MediaWebhookService;
use App\Media\Contracts\VideoProcessor;
use App\Media\DTOs\SignedUploadDTO;
use App\Media\Enums\ProcessingState;
use App\Media\Exceptions\MediaProcessingException;
use App\Models\Media;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Log;

uses(RefreshDatabase::class);

// ─── ProcessingState Enum ───────────────────────────────────────

test('processing state has expected values', function () {
    expect(ProcessingState::Uploading->value)->toBe('uploading')
        ->and(ProcessingState::Processing->value)->toBe('processing')
        ->and(ProcessingState::Ready->value)->toBe('ready')
        ->and(ProcessingState::Failed->value)->toBe('failed')
        ->and(ProcessingState::Deleted->value)->toBe('deleted');
});

test('processing state valid transitions', function () {
    expect(ProcessingState::validTransitions(ProcessingState::Uploading, ProcessingState::Processing))->toBeTrue()
        ->and(ProcessingState::validTransitions(ProcessingState::Uploading, ProcessingState::Failed))->toBeTrue()
        ->and(ProcessingState::validTransitions(ProcessingState::Processing, ProcessingState::Ready))->toBeTrue()
        ->and(ProcessingState::validTransitions(ProcessingState::Processing, ProcessingState::Failed))->toBeTrue()
        ->and(ProcessingState::validTransitions(ProcessingState::Ready, ProcessingState::Deleted))->toBeTrue()
        ->and(ProcessingState::validTransitions(ProcessingState::Failed, ProcessingState::Deleted))->toBeTrue()
        ->and(ProcessingState::validTransitions(ProcessingState::Ready, ProcessingState::Processing))->toBeFalse()
        ->and(ProcessingState::validTransitions(ProcessingState::Deleted, ProcessingState::Ready))->toBeFalse()
        ->and(ProcessingState::validTransitions(ProcessingState::Uploading, ProcessingState::Ready))->toBeFalse();
});

// ─── CloudinaryService ──────────────────────────────────────────

test('cloudinary service generates signature', function () {
    $service = app(CloudinaryService::class);

    $signature = $service->generateSignature(['public_id' => 'test'], 1234567890);

    expect($signature)->toBeString()->not->toBeEmpty();
});

test('cloudinary service returns config values', function () {
    $service = app(CloudinaryService::class);

    expect($service->uploadUrl())->toBeString()
        ->and($service->uploadPreset())->toBeString()
        ->and($service->apiKey())->toBeString();
});

// ─── SignedUploadDTO ────────────────────────────────────────────

test('signed upload dto is readonly', function () {
    $dto = new SignedUploadDTO(
        url: 'https://api.cloudinary.com/v1_1/test/video/upload',
        signature: 'abc123',
        timestamp: 1234567890,
        publicId: 'test_id',
        folder: 'stories/videos/1/2026/07',
        uploadPreset: 'uloak_video',
        apiKey: 'test_api_key',
        mediaId: 1,
        mediaUuid: 'some-uuid',
        eager: 'w_auto,c_limit,q_auto,f_auto',
        eager_notification_url: 'https://uloak.test/api/webhooks/cloudinary',
    );

    expect($dto->url)->toBe('https://api.cloudinary.com/v1_1/test/video/upload')
        ->and($dto->signature)->toBe('abc123')
        ->and($dto->publicId)->toBe('test_id');
});

// ─── Media Model ────────────────────────────────────────────────

test('media can be created as cloudinary video', function () {
    $media = Media::factory()->cloudinary()->create();

    expect($media)->toBeInstanceOf(Media::class)
        ->and($media->provider)->toBe('cloudinary')
        ->and($media->status)->toBe('uploading')
        ->and($media->cloudinary_public_id)->not->toBeNull()
        ->and($media->isCloudinary())->toBeTrue()
        ->and($media->isProcessing())->toBeTrue()
        ->and($media->isReady())->toBeFalse();
});

test('cloudinary media returns cloudinary url', function () {
    $media = Media::factory()->cloudinary()->create();

    $url = $media->url();

    expect($url)->toBeString()
        ->and($url)->toContain('res.cloudinary.com');
});

test('cloudinary media returns thumbnail from field', function () {
    $media = Media::factory()->cloudinary()->create([
        'thumbnail' => 'https://res.cloudinary.com/example/thumbnail.jpg',
    ]);

    $thumbnail = $media->thumbnail();

    expect($thumbnail)->toBe($media->thumbnail);
});

// ─── Processing State Transitions ───────────────────────────────

test('processing service transitions states correctly', function () {
    $media = Media::factory()->cloudinary()->create();
    $service = app(MediaProcessingService::class);

    $media = $service->markProcessing($media);
    expect($media->status)->toBe('processing');

    $media = $service->markReady($media);
    expect($media->status)->toBe('ready')
        ->and($media->processing_completed_at)->not->toBeNull();
});

test('processing service rejects invalid transitions', function () {
    $media = Media::factory()->cloudinary()->create();
    $service = app(MediaProcessingService::class);

    $service->markProcessing($media);
    $service->markReady($media);

    expect(fn () => $service->markProcessing($media))
        ->toThrow(MediaProcessingException::class);
});

test('processing service marks failed with reason', function () {
    $media = Media::factory()->cloudinary()->create();
    $service = app(MediaProcessingService::class);

    $media = $service->markFailed($media, 'Test error');

    expect($media->status)->toBe('failed')
        ->and($media->failed_reason)->toBe('Test error');
});

// ─── Events ─────────────────────────────────────────────────────

test('media processing completed event broadcasts', function () {
    $media = Media::factory()->cloudinary()->create();

    $event = new MediaProcessingCompleted($media);

    $channel = $event->broadcastOn();

    expect($channel->name)->toBe('media')
        ->and($event->broadcastAs())->toBe('media.processing.completed');
});

test('media processing failed event broadcasts', function () {
    $media = Media::factory()->cloudinary()->create();

    $event = new MediaProcessingFailed($media, 'Test error');

    $channel = $event->broadcastOn();

    expect($channel->name)->toBe('media')
        ->and($event->broadcastAs())->toBe('media.processing.failed')
        ->and($event->reason)->toBe('Test error');
});

test('media deleted event broadcasts', function () {
    $media = Media::factory()->cloudinary()->create();

    $event = new MediaDeleted($media);

    $channel = $event->broadcastOn();

    expect($channel->name)->toBe('media')
        ->and($event->broadcastAs())->toBe('media.deleted');
});

// ─── CloudinaryVideoProcessor ───────────────────────────────────

test('cloudinary processor creates pending media on upload', function () {
    $processor = app(CloudinaryVideoProcessor::class);

    $file = File::create('test.mp4', 100, 'video/mp4');
    $media = $processor->upload($file);

    expect($media)->toBeInstanceOf(Media::class)
        ->and($media->type)->toBe('video')
        ->and($media->provider)->toBe('cloudinary')
        ->and($media->status)->toBe('uploading');
});

test('cloudinary processor supports video mime types', function () {
    $processor = app(CloudinaryVideoProcessor::class);

    expect($processor->supports('video/mp4'))->toBeTrue()
        ->and($processor->supports('video/quicktime'))->toBeTrue()
        ->and($processor->supports('image/jpeg'))->toBeFalse();
});

// ─── MediaUploadService ─────────────────────────────────────────

test('upload service creates pending media with cloudinary', function () {
    $service = app(MediaUploadService::class);

    $media = $service->createPendingVideo('video/mp4', 1048576, 'test_video.mp4');

    expect($media)->toBeInstanceOf(Media::class)
        ->and($media->provider)->toBe('cloudinary')
        ->and($media->status)->toBe('uploading')
        ->and($media->type)->toBe('video')
        ->and($media->cloudinary_public_id)->toContain('story_video_');
});

// ─── MediaWebhookService ────────────────────────────────────────

test('webhook service verifies signature', function () {
    $service = app(MediaWebhookService::class);

    $result = $service->verify('test body', 'invalid', 0);

    expect($result)->toBeFalse(); // signature invalid with configured secret
});

test('webhook service throws on missing public_id', function () {
    $service = app(MediaWebhookService::class);

    expect(fn () => $service->handle(['notification_type' => 'upload']))
        ->toThrow(MediaProcessingException::class, 'missing public_id');
});

test('webhook service throws on unknown media', function () {
    $service = app(MediaWebhookService::class);

    expect(fn () => $service->handle([
        'public_id' => 'nonexistent',
        'notification_type' => 'upload',
    ]))->toThrow(MediaProcessingException::class, 'No media found');
});

test('webhook service handles upload notification', function () {
    $media = Media::factory()->cloudinary()->create([
        'type' => 'video',
    ]);
    $service = app(MediaWebhookService::class);

    $result = $service->handle([
        'public_id' => $media->cloudinary_public_id,
        'notification_type' => 'upload',
        'status' => 'success',
        'secure_url' => 'https://res.cloudinary.com/test/video.mp4',
        'asset_id' => 'asset_123',
        'width' => 1920,
        'height' => 1080,
        'bytes' => 2097152,
        'format' => 'mp4',
        'version' => 1,
        'resource_type' => 'video',
        'tags' => [],
        'signature' => 'sig',
        'duration' => 120.5,
        'bit_rate' => 2500000,
        'video' => ['codec' => 'h264'],
        'audio' => ['codec' => 'aac'],
        'frame_rate' => 30.0,
        'pix_format' => 'yuv420p',
        'is_audio' => false,
    ]);

    expect($result->status)->toBe('processing')
        ->and($result->width)->toBe(1920)
        ->and($result->height)->toBe(1080)
        ->and($result->duration)->toBe(120.5)
        ->and($result->aspect_ratio)->toBe(round(1920 / 1080, 4));
});

test('webhook service handles eager notification with sprite', function () {
    $media = Media::factory()->cloudinary()->create([
        'status' => 'processing',
        'type' => 'video',
    ]);
    $service = app(MediaWebhookService::class);

    $result = $service->handle([
        'public_id' => $media->cloudinary_public_id,
        'notification_type' => 'eager',
        'eager' => [
            [
                'transformation' => 'w_auto,c_limit,q_auto,f_auto',
                'secure_url' => 'https://res.cloudinary.com/original.mp4',
                'width' => 1920,
                'height' => 1080,
                'bytes' => 1048576,
            ],
            [
                'transformation' => 'w_640,h_360,c_fill,q_auto,f_auto',
                'secure_url' => 'https://res.cloudinary.com/mobile.mp4',
                'width' => 640,
                'height' => 360,
                'bytes' => 524288,
            ],
            [
                'transformation' => 'so_3,w_640,h_360,c_fill,f_jpg',
                'secure_url' => 'https://res.cloudinary.com/thumb.jpg',
                'width' => 640,
                'height' => 360,
                'bytes' => 65536,
            ],
            [
                'transformation' => 'w_160,h_90,c_fill,fl_sprite,f_vtt',
                'secure_url' => 'https://res.cloudinary.com/sprite.vtt',
                'width' => 160,
                'height' => 90,
                'sprite_image_count' => 10,
            ],
        ],
    ]);

    expect($result->status)->toBe('ready')
        ->and($result->thumbnail)->toContain('thumb.jpg')
        ->and($result->metadata['preview']['url'])->toContain('original.mp4')
        ->and($result->sprite)->not->toBeNull()
        ->and($result->sprite['vtt'])->toContain('sprite.vtt')
        ->and($result->sprite['image'])->toContain('sprite.jpg')
        ->and($result->eager)->toBeTrue()
        ->and($result->eager_response)->toBeArray()
        ->and($result->eager_response[0]['transformation'])->toContain('w_auto');
});

test('webhook service handles failure notification', function () {
    $media = Media::factory()->cloudinary()->create();
    $service = app(MediaWebhookService::class);

    $result = $service->handle([
        'public_id' => $media->cloudinary_public_id,
        'notification_type' => 'upload',
        'status' => 'error',
        'error' => ['message' => 'Processing timeout'],
    ]);

    expect($result->status)->toBe('failed')
        ->and($result->failed_reason)->toBe('Processing timeout');
});

// ─── Analytics Service ─────────────────────────────────────────

test('analytics service logs without errors', function () {
    $service = app(MediaAnalyticsService::class);
    $media = Media::factory()->create();

    Log::shouldReceive('info')->times(4);
    Log::shouldReceive('error')->once();

    $service->uploadStarted($media);
    $service->uploadCompleted($media);
    $service->processingStarted($media);
    $service->processingCompleted($media);
    $service->processingFailed($media, 'Test');

    expect(true)->toBeTrue();
});

// ─── Model Scopes / Helpers ─────────────────────────────────────

test('local media url uses storage manager', function () {
    $media = Media::factory()->create();

    $url = $media->url();

    expect($url)->toBeString();
});

test('upload endpoint still works for images', function () {
    $file = File::image('photo.jpg', 800, 600);

    $response = $this->postJson('/api/media/images/upload', [
        'file' => $file,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => ['id', 'url', 'type'],
        ]);
});

test('video upload endpoint creates pending cloudinary media', function () {
    $file = File::create('video.mp4', 100, 'video/mp4');

    $response = $this->postJson('/api/media/videos/upload', [
        'file' => $file,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => ['id', 'url', 'type', 'status'],
        ]);

    $this->assertDatabaseHas('media', [
        'uuid' => $response->json('data.id'),
        'status' => 'uploading',
        'provider' => 'cloudinary',
    ]);
});

test('cloudinary video processor is bound as default', function () {
    $processor = app(VideoProcessor::class);

    expect($processor)->toBeInstanceOf(CloudinaryVideoProcessor::class);
});
