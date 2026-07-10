<?php

namespace App\Media\Cloudinary;

use Cloudinary\Cloudinary;
use Cloudinary\Utils\SignatureVerifier;

class CloudinaryService
{
    public function __construct(
        protected Cloudinary $cloudinary,
        protected array $config = [],
    ) {}

    public function generateSignature(array $params, int $timestamp): string
    {
        $params['timestamp'] = $timestamp;
        ksort($params);

        $signatureString = urldecode(http_build_query($params));
        logger()->info($signatureString);

        return sha1($signatureString.$this->apiSecret());
    }

    public function verifyWebhookSignature(string $body, string $signature, int|string|null $timestamp = null): bool
    {
        $secret = $this->config['webhook_secret'] ?? '';

        if ($secret === '') {
            return true;
        }

        if ($timestamp === null) {
            return false;
        }

        try {
            return SignatureVerifier::verifyNotificationSignature($body, $timestamp, $signature);
        } catch (\InvalidArgumentException) {
            return false;
        }
    }

    public function verifyApiResponseSignature(string $publicId, int|string $version, string $signature): bool
    {
        try {
            return SignatureVerifier::verifyApiResponseSignature($publicId, $version, $signature);
        } catch (\InvalidArgumentException) {
            return false;
        }
    }

    public function buildEagerTransformations(): string
    {
        return implode('|', [
            // Optimized/original video
            'w_auto,c_limit,q_auto,f_auto',

            // Mobile rendition
            'w_640,h_360,c_fill,q_auto,f_auto',

            // Poster image
            'so_3,w_640,h_360,c_fill,f_jpg',

            // Sprite sheet
            'w_160,h_90,c_fill,fl_sprite,f_vtt',
        ]);
    }

    public function uploadUrl(): string
    {
        return $this->config['upload_url']
            ?? 'https://api.cloudinary.com/v1_1/'.$this->cloudId().'/video/upload';
    }

    public function cloudId(): string
    {
        return $this->config['cloud_name'] ?? '';
    }

    public function uploadPreset(): string
    {
        return $this->config['upload_preset'] ?? '';
    }

    public function apiKey(): string
    {
        return $this->config['api_key'] ?? '';
    }

    public function apiSecret(): string
    {
        return $this->config['api_secret'] ?? '';
    }
}
