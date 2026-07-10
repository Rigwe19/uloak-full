<?php

namespace App\Media\Enums;

enum ImageFormat: string
{
    case Webp = 'webp';
    case Jpeg = 'jpeg';
    case Png = 'png';

    public function mimeType(): string
    {
        return match ($this) {
            self::Webp => 'image/webp',
            self::Jpeg => 'image/jpeg',
            self::Png => 'image/png',
        };
    }

    public static function fromMimeType(string $mimeType): ?self
    {
        return match ($mimeType) {
            'image/webp' => self::Webp,
            'image/jpeg', 'image/jpg' => self::Jpeg,
            'image/png' => self::Png,
            default => null,
        };
    }
}
