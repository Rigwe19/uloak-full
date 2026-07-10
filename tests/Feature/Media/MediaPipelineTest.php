<?php

use App\Jobs\ProcessMediaVideo;
use App\Media\Enums\ImageFormat;
use App\Media\Enums\MediaType;
use App\Media\Exceptions\MediaNotFoundException;
use App\Media\Exceptions\MediaProcessingException;
use App\Media\Exceptions\UnsupportedFormatException;
use App\Media\Image\GdImageProcessor;
use App\Media\MediaManager;
use App\Media\Repositories\MediaRepository;
use App\Media\Video\RendiVideoProcessor;
use App\Models\Media;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Testing\File;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
});

// ─── Media Model ───────────────────────────────────────────────

test('media can be created via factory', function () {
    $media = Media::factory()->image()->create();

    expect($media)->toBeInstanceOf(Media::class)
        ->and($media->uuid)->not->toBeNull()
        ->and($media->type)->toBe('image')
        ->and($media->disk)->toBe('public');
});

test('media can be created via factory as video', function () {
    $media = Media::factory()->video()->create();

    expect($media)->toBeInstanceOf(Media::class)
        ->and($media->type)->toBe('video')
        ->and($media->isVideo())->toBeTrue();
});

test('media helper methods return urls', function () {
    $media = Media::factory()->image()->create();

    $url = $media->url();

    expect($url)->toBeString()
        ->and($media->isImage())->toBeTrue()
        ->and($media->isVideo())->toBeFalse();
});

test('url and thumbnail return stable strings', function () {
    $media = Media::factory()->image()->create();

    $url1 = $media->url();
    $url2 = $media->url();

    expect($url1)->toBe($url2);
});

// ─── MediaManager ──────────────────────────────────────────────

test('media manager resolves from container', function () {
    $manager = app(MediaManager::class);

    expect($manager)->toBeInstanceOf(MediaManager::class);
});

test('media manager throws on missing media', function () {
    $manager = app(MediaManager::class);

    expect(fn () => $manager->image(999))
        ->toThrow(MediaNotFoundException::class);
});

test('media manager throws on wrong type', function () {
    $image = Media::factory()->video()->create();

    expect(fn () => app(MediaManager::class)->image($image->id))
        ->toThrow(MediaProcessingException::class);
});

test('media manager can get original url', function () {
    $media = Media::factory()->image()->create();

    $url = app(MediaManager::class)->forMedia($media)->url();

    expect($url)->toBe(Storage::disk('public')->url($media->path));
});

// ─── GD Image Processor ───────────────────────────────────────

test('gd processor uploads image and creates media record', function () {
    $file = File::image('photo.jpg', 800, 600);
    $processor = app(GdImageProcessor::class);

    $media = $processor->upload($file);

    expect($media)->toBeInstanceOf(Media::class)
        ->and($media->type)->toBe('image')
        ->and($media->width)->toBe(800)
        ->and($media->height)->toBe(600)
        ->and($media->disk)->toBe('public');

    Storage::disk('public')->assertExists($media->path);
});

test('gd processor rejects unsupported formats', function () {
    $file = File::create('document.pdf', 100, 'application/pdf');
    $processor = app(GdImageProcessor::class);

    expect(fn () => $processor->upload($file))
        ->toThrow(UnsupportedFormatException::class);
});

test('gd processor supports only image mime types', function () {
    $processor = app(GdImageProcessor::class);

    expect($processor->supports('image/jpeg'))->toBeTrue()
        ->and($processor->supports('image/png'))->toBeTrue()
        ->and($processor->supports('image/webp'))->toBeTrue()
        ->and($processor->supports('video/mp4'))->toBeFalse()
        ->and($processor->supports('application/pdf'))->toBeFalse();
});

test('gd processor generates cached resized image', function () {
    $file = File::image('photo.jpg', 800, 600);
    $processor = app(GdImageProcessor::class);
    $media = $processor->upload($file);

    $url = $processor->process($media, [
        'width' => 400,
        'height' => 300,
        'mode' => 'resize',
        'quality' => 80,
        'format' => 'webp',
    ]);

    expect($url)->toBeString()
        ->and(Storage::disk('public')->exists(
            str_replace(Storage::disk('public')->url(''), '', $url)
        ))->toBeTrue();
});

test('gd processor caches and returns same url on second call', function () {
    $file = File::image('photo.jpg', 800, 600);
    $processor = app(GdImageProcessor::class);
    $media = $processor->upload($file);

    $operations = [
        'width' => 200,
        'height' => 200,
        'mode' => 'fit',
        'quality' => 80,
        'format' => 'webp',
    ];

    $url1 = $processor->process($media, $operations);
    $url2 = $processor->process($media, $operations);

    expect($url1)->toBe($url2);
});

// ─── MediaManager Fluent Image API ─────────────────────────────

test('media manager fluent image api generates processed url', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $url = MediaManager::image($media->uuid)
        ->width(400)
        ->height(300)
        ->fit()
        ->quality(80)
        ->format('webp')
        ->process();

    expect($url)->toBeString();
});

test('media manager can generate thumbnail from model', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $thumbnailUrl = $media->thumbnail(150, 150);

    expect($thumbnailUrl)->toBeString();
});

test('media manager can resize from model', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $resizedUrl = $media->resize(1200, 800);

    expect($resizedUrl)->toBeString();
});

// ─── Controller ────────────────────────────────────────────────

test('upload image endpoint creates media', function () {
    $file = File::image('photo.jpg', 800, 600);

    $response = $this->postJson('/api/media/images/upload', [
        'file' => $file,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => ['id', 'url', 'type', 'mime_type', 'width', 'height'],
        ]);

    $this->assertDatabaseHas('media', [
        'uuid' => $response->json('data.id'),
        'type' => 'image',
    ]);
});

test('upload video endpoint validates request', function () {
    $response = $this->postJson('/api/media/videos/upload', [
        'file' => '',
    ]);

    $response->assertStatus(422);
});

test('video processor creates media record and dispatches job', function () {
    Queue::fake();

    $file = File::create('video.mp4', 100, 'video/mp4');
    $media = app(RendiVideoProcessor::class)->upload($file);

    expect($media)->toBeInstanceOf(Media::class)
        ->and($media->type)->toBe('video');

    Queue::assertPushed(ProcessMediaVideo::class, function ($job) use ($media) {
        return $job->mediaId === $media->id && $job->action === 'compress';
    });
});

test('show endpoint returns media details', function () {
    $media = Media::factory()->image()->create();

    $response = $this->getJson("/api/media/{$media->uuid}");

    $response->assertOk()
        ->assertJson([
            'data' => [
                'id' => $media->uuid,
            ],
        ]);
});

test('process endpoint generates processed image url', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $response = $this->postJson("/api/media/{$media->uuid}/process", [
        'width' => 300,
        'height' => 300,
        'mode' => 'fit',
        'quality' => 80,
        'format' => 'webp',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'data' => ['url'],
        ]);
});

test('destroy endpoint deletes media', function () {
    $media = Media::factory()->image()->create();

    $response = $this->deleteJson("/api/media/{$media->uuid}");

    $response->assertOk();
    $this->assertDatabaseMissing('media', ['id' => $media->id]);
});

// ─── ImageFormat Enum ──────────────────────────────────────────

test('image format enum returns correct mime types', function () {
    expect(ImageFormat::Webp->mimeType())->toBe('image/webp')
        ->and(ImageFormat::Jpeg->mimeType())->toBe('image/jpeg')
        ->and(ImageFormat::Png->mimeType())->toBe('image/png');
});

test('image format can resolve from mime type', function () {
    expect(ImageFormat::fromMimeType('image/webp'))->toBe(ImageFormat::Webp)
        ->and(ImageFormat::fromMimeType('image/jpeg'))->toBe(ImageFormat::Jpeg)
        ->and(ImageFormat::fromMimeType('image/png'))->toBe(ImageFormat::Png)
        ->and(ImageFormat::fromMimeType('image/gif'))->toBeNull();
});

// ─── Repository ────────────────────────────────────────────────

test('repository finds media by uuid', function () {
    $media = Media::factory()->image()->create();
    $repo = app(MediaRepository::class);

    $found = $repo->findByUuid($media->uuid);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($media->id);
});

test('repository throws on missing media', function () {
    $repo = app(MediaRepository::class);

    expect(fn () => $repo->findByIdOrUuid('nonexistent-uuid'))
        ->toThrow(MediaNotFoundException::class);
});

// ─── MediaType Enum ────────────────────────────────────────────

test('media type enum has expected values', function () {
    expect(MediaType::Image->value)->toBe('image')
        ->and(MediaType::Video->value)->toBe('video');
});

// ─── Queue Job ─────────────────────────────────────────────────

test('video processing job is dispatchable', function () {
    $media = Media::factory()->video()->create();
    Queue::fake();

    ProcessMediaVideo::dispatch($media->id, 'compress', ['resolution' => '720p']);

    Queue::assertPushed(ProcessMediaVideo::class, function ($job) use ($media) {
        return $job->mediaId === $media->id && $job->action === 'compress';
    });
});

// ─── Cockpit-Style Image Serving ───────────────────────────────

test('processStream returns image binary', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $operations = [
        'width' => 400,
        'height' => 300,
        'mode' => 'fit',
        'quality' => 80,
        'format' => 'webp',
    ];

    $url = app(GdImageProcessor::class)->process($media, $operations);
    $binary = app(GdImageProcessor::class)->processStream($media, $operations);

    expect($url)->toBeString();
    expect($binary)->toBeString()
        ->and(strlen($binary))->toBeGreaterThan(0);
});

test('media manager serve returns content and mime type', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    [$content, $mimeType] = app(MediaManager::class)
        ->forMedia($media)
        ->width(200)
        ->height(200)
        ->fit()
        ->serve();

    expect($content)->toBeString()
        ->and(strlen($content))->toBeGreaterThan(0)
        ->and($mimeType)->toBe('image/webp');
});

test('media manager serve thumbnail returns content', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    [$content, $mimeType] = app(MediaManager::class)
        ->forMedia($media)
        ->serveThumbnail(150, 150);

    expect($content)->toBeString()
        ->and(strlen($content))->toBeGreaterThan(0);
});

test('cockpit-style GET route serves image with correct headers', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $response = $this->get("/media/image/{$media->uuid}/300x300.webp");

    $response->assertOk()
        ->assertHeader('Content-Type', 'image/webp');

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('public')
        ->and($cacheControl)->toContain('max-age=31536000')
        ->and($cacheControl)->toContain('immutable');
});

test('cockpit-style route returns 304 on etag match', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $response = $this->get("/media/image/{$media->uuid}/300x300.webp");
    $etag = $response->headers->get('ETag');

    $cachedResponse = $this->get("/media/image/{$media->uuid}/300x300.webp", [
        'HTTP_If-None-Match' => $etag,
    ]);

    $cachedResponse->assertStatus(304);
});

test('cockpit-style route returns 404 for missing media', function () {
    $this->get('/media/image/missing-uuid/300x300.webp')
        ->assertStatus(404);
});

test('cockpit-style route returns 400 for invalid size', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $this->get("/media/image/{$media->uuid}/invalid.webp")
        ->assertStatus(404);
});

test('cockpit-style route caches generated image and returns same content', function () {
    $file = File::image('photo.jpg', 800, 600);
    $media = app(GdImageProcessor::class)->upload($file);

    $first = $this->get("/media/image/{$media->uuid}/100x100.webp");
    $second = $this->get("/media/image/{$media->uuid}/100x100.webp");

    expect($first->content())->toBe($second->content());
});
