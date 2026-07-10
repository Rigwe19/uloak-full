<?php

namespace App\Media\Cloudinary;

use App\Media\Contracts\VideoProcessor;
use App\Media\Repositories\MediaRepository;
use App\Models\Media;
use Illuminate\Http\UploadedFile;

class CloudinaryVideoProcessor implements VideoProcessor
{
    public function __construct(
        protected MediaRepository $repository,
        protected CloudinaryService $cloudinary,
        protected MediaUploadService $uploadService,
        protected MediaWebhookService $webhookService,
        protected array $config = [],
    ) {}

    public function upload(UploadedFile $file): Media
    {
        $mimeType = $file->getMimeType() ?: $file->getClientMimeType();

        $media = $this->uploadService->createPendingVideo(
            mimeType: $mimeType,
            size: $file->getSize(),
            originalName: $file->getClientOriginalName(),
        );

        return $media;
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

    public function supports(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'video/');
    }

    public function processAsync(Media $media, string $action, array $options = []): Media
    {
        return $media;
    }

    public function handleCallback(array $payload, ?string $signature = null): Media
    {
        return $this->webhookService->handle($payload, $signature);
    }
}
