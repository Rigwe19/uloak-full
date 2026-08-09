<?php

namespace App\Media\Image;

use App\Media\Contracts\ImageProcessor;
use App\Media\Enums\MediaType;
use App\Media\Enums\ProcessingState;
use App\Media\Exceptions\UnsupportedFormatException;
use App\Media\Repositories\MediaRepository;
use App\Media\Storage\StorageManager;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class LaravelImageProcessor implements ImageProcessor
{
    protected const SUPPORTED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
        'image/heic',
        'image/heif',
    ];

    public function __construct(
        protected MediaRepository $repository,
        protected StorageManager $storage,
        protected array $config = [],
    ) {
    }

    public function upload(UploadedFile $file): Media
    {
        $mimeType = $file->getMimeType() ?: $file->getClientMimeType();

        if (!$this->supports($mimeType)) {
            throw new UnsupportedFormatException(
                mimeType: $mimeType,
                driver: 'laravel-image',
            );
        }

        $image = Image::fromUpload($file);

        [$width, $height] = $image->dimensions();

        $checksum = md5_file($file->getRealPath());

        $disk = $this->storageDisk();

        // Create record first so we have the UUID.
        $media = $this->repository->createFromUpload(
            file: $file,
            path: '',
            disk: $disk,
            type: MediaType::Image,
            width: $width,
            height: $height,
            checksum: $checksum,
        );

        $uuid = $media->uuid ?? (string) $media->id;

        /*
         * Original WebP
         */
        $originalPath = $this->originalsPath() . '/' . $uuid . '.webp';

        $image
            ->toWebp()
            ->quality($this->config['quality'] ?? 85)
            ->storeAs(
                $this->originalsPath(),
                $uuid . '.webp',
                $disk,
            );

        /*
         * Thumbnail WebP
         */
        $thumbnailPath = $this->thumbnailsPath() . '/' . $uuid . '.webp';

        Image::fromUpload($file)
            ->cover(800, 800)
            ->toWebp()
            ->quality($this->config['thumbnail_quality'] ?? 80)
            ->storeAs(
                $this->thumbnailsPath(),
                $uuid . '.webp',
                $disk,
            );

        /*
         * Update media record.
         */
        $media->update([
            'path' => $originalPath,
            'thumbnail' => $thumbnailPath,
            'status' => ProcessingState::Ready->value,
            'progress' => 100,
        ]);

        return $media->refresh();
    }

    public function process(Media $media, array $operations): string
    {
        $cachePath = $this->resolveCachePath($media, $operations);

        return $this->storage->url($cachePath, $this->cacheDisk());
    }

    public function processStream(Media $media, array $operations): string
    {
        $cachePath = $this->resolveCachePath($media, $operations);

        return $this->storage->get($cachePath, $this->cacheDisk());
    }

    protected function resolveCachePath(Media $media, array $operations): string
    {
        $format = $operations['format'] ?? $this->config['default_format'] ?? 'webp';
        $quality = $operations['quality'] ?? $this->config['quality'] ?? 80;
        $width = $operations['width'] ?? null;
        $height = $operations['height'] ?? null;
        $mode = $operations['mode'] ?? 'resize';

        $cachePath = $this->buildCachePath($media, $width, $height, $mode, $quality, $format);
        $cacheDisk = $this->cacheDisk();

        if ($this->storage->exists($cachePath, $cacheDisk)) {
            return $cachePath;
        }

        // Load original image from storage
        $originalPath = $media->path;
        $originalDisk = $media->disk ?? 'public';

        if (!$this->storage->exists($originalPath, $originalDisk)) {
            throw new RuntimeException("Original file not found for media [{$media->id}].");
        }

        $image = Image::fromStorage($originalPath, $originalDisk);

        // Apply transformations
        $transformed = $this->applyOperations($image, $width, $height, $mode);

        // Encode and store
        $transformed = match ($format) {
            'webp' => $transformed->toWebp(),
            'jpeg', 'jpg' => $transformed->toJpg(),
            'png' => $transformed->toPng(),
            'gif' => $transformed->toGif(),
            'avif' => $transformed->toAvif(),
            default => $transformed->toWebp(),
        };

        $transformed->quality($quality);
        $transformed->store($cachePath, $cacheDisk);

        return $cachePath;
    }

    public function supports(string $mimeType): bool
    {
        return in_array($mimeType, self::SUPPORTED_MIME_TYPES, true);
    }

    protected function applyOperations($image, ?int $width, ?int $height, string $mode)
    {
        $originalWidth = $image->width();
        $originalHeight = $image->height();

        if ($width === null && $height === null) {
            return $image;
        }

        return match ($mode) {
            'contain' => $image->contain($width ?? $originalWidth, $height ?? $originalHeight),
            'fit' => $image->cover($width ?? $originalWidth, $height ?? $originalHeight),
            default => $image->resize($width, $height),
        };
    }

    protected function buildCachePath(
        Media $media,
        ?int $width,
        ?int $height,
        string $mode,
        int $quality,
        string $format,
    ): string {
        $cacheBase = $this->config['paths']['cache'] ?? 'media/cache';
        $mediaDir = $media->uuid ?? $media->id;

        $size = implode('x', array_filter([$width ?? 'auto', $height ?? 'auto']));

        return "{$cacheBase}/{$mediaDir}/{$size}_{$mode}_q{$quality}.{$format}";
    }

    protected function originalsPath(): string
    {
        return $this->config['paths']['originals'] ?? 'media/originals';
    }

    protected function thumbnailsPath(): string
    {
        return $this->config['paths']['thumbnails']
            ?? 'media/thumbnails';
    }

    protected function processedPath(): string
    {
        return $this->config['paths']['processed'] ?? 'media/processed';
    }

    protected function cacheDisk(): string
    {
        return $this->config['cache_disk'] ?? 'public';
    }

    protected function storageDisk(): string
    {
        return $this->config['storage_disk'] ?? 'public';
    }
}
