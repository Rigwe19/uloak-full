<?php

namespace App\Providers;

use App\Media\Cloudinary\CloudinaryService;
use App\Media\Cloudinary\CloudinaryVideoProcessor;
use App\Media\Cloudinary\MediaAnalyticsService;
use App\Media\Cloudinary\MediaProcessingService;
use App\Media\Cloudinary\MediaUploadService;
use App\Media\Cloudinary\MediaWebhookService;
use App\Media\Contracts\ImageProcessor;
use App\Media\Contracts\VideoProcessor;
use App\Media\Image\CloudinaryImageProcessor;
use App\Media\Image\GdImageProcessor;
use App\Media\MediaManager;
use App\Media\Repositories\MediaRepository;
use App\Media\Storage\StorageManager;
use App\Media\Video\FfmpegVideoProcessor;
use App\Media\Video\RendiVideoProcessor;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class MediaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            config_path('media.php'), 'media'
        );

        $this->app->singleton(StorageManager::class, function (Application $app): StorageManager {
            return new StorageManager(
                defaultDisk: config('media.storage.disk', 'public'),
            );
        });

        $this->app->singleton(Cloudinary::class, function (Application $app): Cloudinary {
            $config = config('media.cloudinary', []);

            $cloudConfig = [
                'cloud_name' => $config['cloud_name'] ?? '',
                'api_key' => $config['api_key'] ?? '',
                'api_secret' => $config['api_secret'] ?? '',
            ];

            // Ensure Configuration::instance() is initialized for SignatureVerifier
            Configuration::instance($cloudConfig);

            return new Cloudinary($cloudConfig);
        });

        $this->app->singleton(CloudinaryService::class, function (Application $app): CloudinaryService {
            return new CloudinaryService(
                cloudinary: $app->make(Cloudinary::class),
                config: config('media.cloudinary', []),
            );
        });

        $this->app->singleton(MediaUploadService::class, function (Application $app): MediaUploadService {
            return new MediaUploadService(
                repository: $app->make(MediaRepository::class),
                cloudinary: $app->make(CloudinaryService::class),
            );
        });

        $this->app->singleton(MediaWebhookService::class, function (Application $app): MediaWebhookService {
            return new MediaWebhookService(
                repository: $app->make(MediaRepository::class),
                cloudinary: $app->make(CloudinaryService::class),
            );
        });

        $this->app->singleton(MediaProcessingService::class, function (Application $app): MediaProcessingService {
            return new MediaProcessingService(
                repository: $app->make(MediaRepository::class),
            );
        });

        $this->app->singleton(MediaAnalyticsService::class);

        $this->app->bind(CloudinaryVideoProcessor::class, function (Application $app): CloudinaryVideoProcessor {
            return new CloudinaryVideoProcessor(
                repository: $app->make(MediaRepository::class),
                cloudinary: $app->make(CloudinaryService::class),
                uploadService: $app->make(MediaUploadService::class),
                webhookService: $app->make(MediaWebhookService::class),
                config: config('media.cloudinary', []),
            );
        });

        $this->app->bind(GdImageProcessor::class, function (Application $app): GdImageProcessor {
            return new GdImageProcessor(
                repository: $app->make(MediaRepository::class),
                storage: $app->make(StorageManager::class),
                config: config('media.image', []),
            );
        });

        $this->app->bind(RendiVideoProcessor::class, function (Application $app): RendiVideoProcessor {
            return new RendiVideoProcessor(
                repository: $app->make(MediaRepository::class),
                storage: $app->make(StorageManager::class),
                config: array_merge(config('media.video', []), config('media.rendi', [])),
            );
        });

        $this->app->bind(ImageProcessor::class, function (Application $app): ImageProcessor {
            $driver = config('media.image.driver', 'gd');

            return match ($driver) {
                'gd' => $app->make(GdImageProcessor::class),
                'cloudinary' => $app->make(CloudinaryImageProcessor::class),
                default => throw new \RuntimeException("Unknown image driver: {$driver}"),
            };
        });

        $this->app->bind(VideoProcessor::class, function (Application $app): VideoProcessor {
            $driver = config('media.video.driver', 'cloudinary');

            return match ($driver) {
                'cloudinary' => $app->make(CloudinaryVideoProcessor::class),
                'rendi' => $app->make(RendiVideoProcessor::class),
                'ffmpeg' => $app->make(FfmpegVideoProcessor::class),
                default => throw new \RuntimeException("Unknown video driver: {$driver}"),
            };
        });

        $this->app->singleton(MediaManager::class, function (Application $app): MediaManager {
            return new MediaManager(
                repository: $app->make(MediaRepository::class),
                storage: $app->make(StorageManager::class),
                defaultImageProcessor: $app->make(ImageProcessor::class),
                defaultVideoProcessor: $app->make(VideoProcessor::class),
            );
        });
    }
}
