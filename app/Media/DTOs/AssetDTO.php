<?php

namespace App\Media\DTOs;

readonly class AssetDTO
{
    public function __construct(
        public string $secureUrl,
        public string $publicId,
        public int $width,
        public int $height,
        public string $format,
        public string $resourceType,
        public int $bytes,
    ) {}
}
