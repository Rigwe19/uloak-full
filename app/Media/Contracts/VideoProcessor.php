<?php

namespace App\Media\Contracts;

use App\Models\Media;
use Illuminate\Http\UploadedFile;

interface VideoProcessor
{
    public function upload(UploadedFile $file): Media;

    public function compress(Media $media, array $options = []): Media;

    public function resize(Media $media, int $width, int $height): Media;

    public function thumbnail(Media $media, array $options = []): Media;

    public function optimize(Media $media): Media;

    public function supports(string $mimeType): bool;

    /**
     * Submit a job for async processing. Stores job reference in metadata, does not wait for completion.
     */
    public function processAsync(Media $media, string $action, array $options = []): Media;

    /**
     * Handle a callback/webhook from the processing service.
     */
    public function handleCallback(array $payload, ?string $signature = null): Media;
}
