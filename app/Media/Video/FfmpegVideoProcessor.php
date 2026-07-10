<?php

namespace App\Media\Video;

use App\Media\Contracts\VideoProcessor;
use App\Models\Media;
use Illuminate\Http\UploadedFile;

class FfmpegVideoProcessor implements VideoProcessor
{
    public function upload(UploadedFile $file): Media
    {
        throw new \RuntimeException('FfmpegVideoProcessor is not yet implemented.');
    }

    public function compress(Media $media, array $options = []): Media
    {
        throw new \RuntimeException('FfmpegVideoProcessor is not yet implemented.');
    }

    public function resize(Media $media, int $width, int $height): Media
    {
        throw new \RuntimeException('FfmpegVideoProcessor is not yet implemented.');
    }

    public function thumbnail(Media $media, array $options = []): Media
    {
        throw new \RuntimeException('FfmpegVideoProcessor is not yet implemented.');
    }

    public function optimize(Media $media): Media
    {
        throw new \RuntimeException('FfmpegVideoProcessor is not yet implemented.');
    }

    public function supports(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'video/');
    }
}
