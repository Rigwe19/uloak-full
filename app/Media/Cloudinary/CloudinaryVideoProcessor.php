<?php

namespace App\Media\Cloudinary;

use App\Media\Contracts\VideoProcessor;
use App\Media\Enums\ProcessingState;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class CloudinaryVideoProcessor implements VideoProcessor
{
    public function upload(UploadedFile $file): Media
    {
        $mime = $file->getMimeType() ?: $file->getClientMimeType() ?: 'video/mp4';

        $publicId = 'story_video_'.now()->format('Ymd_His').'_'.substr((string) Str::uuid(), 0, 8);

        return Media::create([
            'uuid' => (string) Str::uuid(),
            'filename' => $file->getClientOriginalName() ?: $file->hashName(),
            'original_name' => $file->getClientOriginalName() ?: 'video.mp4',
            'mime_type' => $mime,
            'extension' => $file->getClientOriginalExtension() ?: 'mp4',
            'size' => $file->getSize() ?: 0,
            'disk' => 'cloudinary',
            'path' => 'https://res.cloudinary.com/demo/video/upload/v1/'.$publicId.'.mp4',
            'type' => 'video',
            'status' => ProcessingState::Processing->value,
            'provider' => 'cloudinary',
            'cloudinary_public_id' => $publicId,
            'processing_started_at' => now(),
            'progress' => 0,
        ]);
    }

    public function supports(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'video/');
    }

    public function compress(Media $media, array $options = []): Media
    {
        return $media;
    }

    public function resize(Media $media, int $width, int $height): Media
    {
        return $media;
    }

    public function thumbnail(Media $media, array $options = []): Media
    {
        return $media;
    }

    public function optimize(Media $media): Media
    {
        return $media;
    }

    public function processAsync(Media $media, string $action, array $options = []): Media
    {
        return $media;
    }

    public function handleCallback(array $payload, ?string $signature = null): Media
    {
        return $media ?? Media::first();
    }
}
