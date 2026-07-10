<?php

namespace App\Media\DTOs;

readonly class SignedUploadDTO
{
    public function __construct(
        public string $url,
        public string $signature,
        public int $timestamp,
        public string $publicId,
        public string $folder,
        public string $uploadPreset,
        public string $apiKey,
        public int $mediaId,
        public string $mediaUuid,
        public string $eager,
        public string $eager_notification_url
    ) {}
}
