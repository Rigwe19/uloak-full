<?php

namespace App\Providers;

use App\Media\Contracts\ImageProcessor;
use App\Media\Contracts\VideoProcessor;
use App\Media\Image\LaravelImageProcessor;
use App\Media\MediaManager;
use App\Media\Repositories\MediaRepository;
use App\Media\Storage\StorageManager;
use App\Media\Video\LocalFfmpegVideoProcessor;
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

        // Use Laravel Image for all image processing
        $this->app->bind(ImageProcessor::class, function (Application $app): ImageProcessor {
            return new LaravelImageProcessor(
                repository: $app->make(MediaRepository::class),
                storage: $app->make(StorageManager::class),
                config: config('media.image', []),
            );
        });

        // Use local ffmpeg for all video processing
        $this->app->bind(VideoProcessor::class, function (Application $app): VideoProcessor {
            return new LocalFfmpegVideoProcessor(
                repository: $app->make(MediaRepository::class),
                storage: $app->make(StorageManager::class),
                config: config('media.video', []),
            );
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
