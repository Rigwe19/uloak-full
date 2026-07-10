<?php

namespace App\Media\DTOs;

use App\Media\Enums\ProcessingState;

readonly class WebhookPayloadDTO
{
    public function __construct(
        public string $publicId,
        public ProcessingState $status,
        public string $secureUrl,
        public int $width,
        public int $height,
        public float $duration,
        public float $bitrate,
        public string $videoCodec,
        public string $audioCodec,
        public float $frameRate,
        public int $bytes,
        public string $format,
        public ?string $thumbnailUrl = null,
        public ?string $previewUrl = null,
        public ?SpriteDTO $sprite = null,
    ) {}
}
