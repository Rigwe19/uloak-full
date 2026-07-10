<?php

namespace App\Media\DTOs;

readonly class SpriteDTO
{
    public function __construct(
        public string $url,
        public int $frameWidth,
        public int $frameHeight,
        public float $frameInterval,
        public int $columns,
        public int $rows,
    ) {}
}
