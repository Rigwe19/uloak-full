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

    public function buildVideoEagerTransformations(): string
    {
        return implode('|', [
            'w_auto,c_limit,q_auto,f_auto',
            'w_640,h_360,c_fill,q_auto,f_auto',
            'so_3,w_640,h_360,c_fill,f_jpg',
            'w_160,h_90,c_fill,fl_sprite,f_vtt',
        ]);
    }

    public function buildImageEagerTransformations(): string
    {
        return implode('|', [
            'w_auto,c_limit,q_auto,f_auto',
            'w_150,h_150,c_fill,q_auto,f_auto',
            'w_640,h_640,c_limit,q_auto,f_auto',
            'w_1200,h_1200,c_limit,q_auto,f_auto',
        ]);
    }

    public function buildEagerTransformations(): string
    {
        return $this->buildVideoEagerTransformations();
    }

    public function uploadUrl(?string $resourceType = 'video'): string
    {
        if ($this->config['upload_url'] ?? null) {
            return $this->config['upload_url'];
        }

        $base = 'https://api.cloudinary.com/v1_1/'.$this->cloudId();

        return match ($resourceType) {
            'image' => $base.'/image/upload',
            'raw' => $base.'/raw/upload',
            default => $base.'/video/upload',
        };
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

    /**
     * Delete a resource from Cloudinary by its public ID.
     */
    public function deleteResource(string $publicId, ?string $resourceType = null): bool
    {
        if (empty($publicId)) {
            return false;
        }

        try {
            $type = $resourceType ?? $this->inferResourceType($publicId);

            $result = $this->cloudinary->uploadApi()->destroy($publicId, [
                'resource_type' => $type,
            ]);

            $deleted = ($result['result'] ?? '') === 'ok';

            if (! $deleted) {
                logger()->warning('Cloudinary deletion returned non-ok result', [
                    'public_id' => $publicId,
                    'result' => $result,
                ]);
            }

            return $deleted;
        } catch (\Throwable $e) {
            logger()->error('Failed to delete Cloudinary resource', [
                'public_id' => $publicId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Infer the Cloudinary resource type from the public ID prefix.
     */
    protected function inferResourceType(string $publicId): string
    {
        if (str_contains($publicId, 'story_video_') || str_contains($publicId, 'videos/')) {
            return 'video';
        }

        if (str_contains($publicId, 'story_image_') || str_contains($publicId, 'images/')) {
            return 'image';
        }

        if (str_contains($publicId, 'story_document_') || str_contains($publicId, 'raw/')) {
            return 'raw';
        }

        return 'image';
    }

    /**
     * Extract Cloudinary public ID from a Cloudinary URL.
     */
    public static function extractPublicIdFromUrl(string $url): ?string
    {
        // Pattern: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
        // Or: https://res.cloudinary.com/{cloud}/video/upload/v{version}/{public_id}.{ext}
        $pattern = '/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/';

        if (preg_match($pattern, $url, $matches)) {
            $publicId = $matches[1];

            // Remove any transformation segments
            if (str_contains($publicId, '/')) {
                $parts = explode('/', $publicId);
                $publicId = end($parts);
            }

            return $publicId;
        }

        return null;
    }
}
