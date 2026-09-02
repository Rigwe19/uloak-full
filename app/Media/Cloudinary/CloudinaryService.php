<?php

namespace App\Media\Cloudinary;

class CloudinaryService
{
    public function generateSignature(array $params, int $timestamp): string
    {
        $params['timestamp'] = $timestamp;
        ksort($params);
        $toSign = http_build_query($params, '', '&', PHP_QUERY_RFC3986);
        // Cloudinary signs with & separator and without url encoding differences handled via http_build_query
        // Use api_secret from config if available
        $secret = config('services.cloudinary.api_secret') ?? config('cloudinary.api_secret') ?? env('CLOUDINARY_API_SECRET', 'test_secret');

        return hash_hmac('sha256', $toSign, $secret);
    }

    public function uploadUrl(): string
    {
        $cloudName = config('services.cloudinary.cloud_name') ?? config('cloudinary.cloud_name') ?? env('CLOUDINARY_CLOUD_NAME', 'test');
        $url = config('services.cloudinary.upload_url') ?? env('CLOUDINARY_UPLOAD_URL');

        if ($url) {
            return $url;
        }

        return "https://api.cloudinary.com/v1_1/{$cloudName}/video/upload";
    }

    public function uploadPreset(): string
    {
        return config('services.cloudinary.upload_preset') ?? config('cloudinary.upload_preset') ?? env('CLOUDINARY_UPLOAD_PRESET', 'uloofstories_video');
    }

    public function apiKey(): string
    {
        return config('services.cloudinary.api_key') ?? config('cloudinary.api_key') ?? env('CLOUDINARY_API_KEY', 'test_api_key');
    }
}
