<?php

namespace App\Media\Cloudinary;

use App\Media\Enums\ProcessingState;
use App\Models\Media;
use Illuminate\Support\Str;

class MediaUploadService
{
    public function createPendingVideo(string $mime, int $size, string $filename): Media
    {
        $publicId = 'story_video_'.now()->format('Ymd_His').'_'.substr((string) Str::uuid(), 0, 8);

        return Media::create([
            'uuid' => (string) Str::uuid(),
            'filename' => $filename,
            'original_name' => $filename,
            'mime_type' => $mime,
            'extension' => pathinfo($filename, PATHINFO_EXTENSION) ?: 'mp4',
            'size' => $size,
            'disk' => 'cloudinary',
            'path' => 'https://res.cloudinary.com/demo/video/upload/v1/'.$publicId.'.mp4',
            'type' => 'video',
            'status' => ProcessingState::Uploading->value,
            'provider' => 'cloudinary',
            'cloudinary_public_id' => $publicId,
        ]);
    }
}
