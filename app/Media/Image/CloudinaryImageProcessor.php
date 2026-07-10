<?php

namespace App\Media\Image;

use App\Media\Contracts\ImageProcessor;
use App\Models\Media;
use Illuminate\Http\UploadedFile;

class CloudinaryImageProcessor implements ImageProcessor
{
    protected const SUPPORTED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/avif',
    ];

    public function upload(UploadedFile $file): Media
    {
        throw new \RuntimeException('CloudinaryImageProcessor is not yet implemented.');
    }

    public function process(Media $media, array $operations): string
    {
        throw new \RuntimeException('CloudinaryImageProcessor is not yet implemented.');
    }

    public function processStream(Media $media, array $operations): string
    {
        throw new \RuntimeException('CloudinaryImageProcessor is not yet implemented.');
    }

    public function supports(string $mimeType): bool
    {
        return in_array($mimeType, self::SUPPORTED_MIME_TYPES, true);
    }
}
