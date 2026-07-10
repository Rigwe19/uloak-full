<?php

namespace App\Media\Image;

use App\Media\Contracts\ImageProcessor;
use App\Media\Enums\MediaType;
use App\Media\Exceptions\UnsupportedFormatException;
use App\Media\Repositories\MediaRepository;
use App\Media\Storage\StorageManager;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class GdImageProcessor implements ImageProcessor
{
    protected const SUPPORTED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    public function __construct(
        protected MediaRepository $repository,
        protected StorageManager $storage,
        protected array $config = [],
    ) {}

    public function upload(UploadedFile $file): Media
    {
        $mimeType = $file->getMimeType() ?: $file->getClientMimeType();

        if (! $this->supports($mimeType)) {
            throw new UnsupportedFormatException(
                mimeType: $mimeType,
                driver: 'gd',
            );
        }

        $path = $this->storage->store($file, $this->originalsPath());

        $dimensions = $this->getDimensions($file);
        $checksum = md5_file($file->getRealPath());

        return $this->repository->createFromUpload(
            file: $file,
            path: $path,
            disk: $this->storageDisk(),
            type: MediaType::Image,
            width: $dimensions['width'] ?? null,
            height: $dimensions['height'] ?? null,
            checksum: $checksum,
        );
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

        $originalContents = $this->storage->get($media->path, $media->disk);

        if ($originalContents === null) {
            throw new RuntimeException("Original file not found for media [{$media->id}].");
        }

        $image = imagecreatefromstring($originalContents);

        if ($image === false) {
            throw new RuntimeException("Failed to decode original image for media [{$media->id}].");
        }

        try {
            $processed = $this->applyOperations($image, $width, $height, $mode, $quality, $format);

            $this->storage->put($cachePath, $processed, $cacheDisk);
        } finally {
            imagedestroy($image);
        }

        return $cachePath;
    }

    public function supports(string $mimeType): bool
    {
        return in_array($mimeType, self::SUPPORTED_MIME_TYPES, true);
    }

    protected function applyOperations(
        $image,
        ?int $width,
        ?int $height,
        string $mode,
        int $quality,
        string $format,
    ): string {
        $originalWidth = imagesx($image);
        $originalHeight = imagesy($image);

        if ($width === null && $height === null) {
            $destWidth = $originalWidth;
            $destHeight = $originalHeight;
        } else {
            [$destWidth, $destHeight] = $this->calculateDimensions(
                $originalWidth, $originalHeight, $width, $height, $mode
            );
        }

        $resampled = imagecreatetruecolor($destWidth, $destHeight);

        if ($resampled === false) {
            throw new RuntimeException('Failed to create true color image.');
        }

        try {
            $this->preserveTransparency($resampled, $format);

            imagecopyresampled(
                $resampled, $image,
                0, 0, 0, 0,
                $destWidth, $destHeight,
                $originalWidth, $originalHeight
            );

            if ($mode === 'fit' && $width !== null && $height !== null) {
                $resampled = $this->applyCrop($resampled, $width, $height);
            }

            return $this->encodeImage($resampled, $format, $quality);
        } finally {
            imagedestroy($resampled);
        }
    }

    protected function calculateDimensions(
        int $originalWidth,
        int $originalHeight,
        ?int $requestedWidth,
        ?int $requestedHeight,
        string $mode,
    ): array {
        if ($mode === 'contain') {
            return $this->calculateContainDimensions($originalWidth, $originalHeight, $requestedWidth, $requestedHeight);
        }

        $width = $requestedWidth ?? $originalWidth;
        $height = $requestedHeight ?? $originalHeight;

        if ($mode === 'fit') {
            $ratio = min($width / $originalWidth, $height / $originalHeight);
            $width = (int) round($originalWidth * $ratio);
            $height = (int) round($originalHeight * $ratio);
        }

        return [$width, $height];
    }

    protected function calculateContainDimensions(
        int $originalWidth,
        int $originalHeight,
        ?int $maxWidth,
        ?int $maxHeight,
    ): array {
        $width = $originalWidth;
        $height = $originalHeight;

        if ($maxWidth !== null && $width > $maxWidth) {
            $ratio = $maxWidth / $width;
            $width = $maxWidth;
            $height = (int) round($height * $ratio);
        }

        if ($maxHeight !== null && $height > $maxHeight) {
            $ratio = $maxHeight / $height;
            $height = $maxHeight;
            $width = (int) round($width * $ratio);
        }

        return [$width, $height];
    }

    protected function applyCrop($image, int $targetWidth, int $targetHeight): \GdImage
    {
        $srcWidth = imagesx($image);
        $srcHeight = imagesy($image);

        $srcRatio = $srcWidth / $srcHeight;
        $targetRatio = $targetWidth / $targetHeight;

        if ($srcRatio > $targetRatio) {
            $cropWidth = (int) round($srcHeight * $targetRatio);
            $cropHeight = $srcHeight;
        } else {
            $cropWidth = $srcWidth;
            $cropHeight = (int) round($srcWidth / $targetRatio);
        }

        $srcX = (int) round(($srcWidth - $cropWidth) / 2);
        $srcY = (int) round(($srcHeight - $cropHeight) / 2);

        $cropped = imagecreatetruecolor($targetWidth, $targetHeight);

        if ($cropped === false) {
            throw new RuntimeException('Failed to create cropped image.');
        }

        $this->preserveTransparency($cropped, 'png');

        imagecopyresampled(
            $cropped, $image,
            0, 0, $srcX, $srcY,
            $targetWidth, $targetHeight,
            $cropWidth, $cropHeight
        );

        return $cropped;
    }

    protected function preserveTransparency(\GdImage $image, string $format): void
    {
        if ($format === 'png') {
            imagealphablending($image, false);
            imagesavealpha($image, true);
        }
    }

    protected function encodeImage(\GdImage $image, string $format, int $quality): string
    {
        ob_start();

        try {
            $result = match ($format) {
                'webp' => imagewebp($image, null, $quality),
                'jpeg', 'jpg' => imagejpeg($image, null, $quality),
                'png' => imagepng($image, null, (int) round(9 - ($quality / 100) * 9)),
                default => throw new RuntimeException("Unsupported output format: {$format}."),
            };

            if ($result === false) {
                throw new RuntimeException("Failed to encode image as {$format}.");
            }

            return ob_get_contents();
        } finally {
            ob_end_clean();
        }
    }

    protected function getDimensions(UploadedFile $file): array
    {
        $dimensions = @getimagesize($file->getRealPath());

        if ($dimensions === false) {
            return [];
        }

        return [
            'width' => $dimensions[0],
            'height' => $dimensions[1],
        ];
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

    protected function cacheDisk(): string
    {
        return $this->config['cache_disk'] ?? 'public';
    }

    protected function storageDisk(): string
    {
        return $this->config['storage_disk'] ?? 'public';
    }
}
