<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaUrl
{
    public static function resolve(?string $path, ?Request $request = null): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Normalise leading /storage or relative storage path
        $relative = ltrim($path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = ltrim(substr($relative, strlen('storage/')), '/');
        }

        // If stored as full cloudinary URL or /storage reference, fall back to Storage::url but with host-corrected origin
        $storageUrl = Storage::disk('public')->url($relative);

        if ($request) {
            // Prefer the host that the client actually used (useful behind ngrok / tunneling).
            // Rewrite origin if Storage::url used APP_URL (uloak.test) which mobile device cannot resolve.
            $requestOrigin = $request->getSchemeAndHttpHost();
            // If storageUrl host differs (ullo/test or localhost), rewrite to request origin.
            if (str_contains($storageUrl, 'uloak.test') || str_contains($storageUrl, 'localhost')) {
                $parsed = parse_url($storageUrl);
                $pathOnly = ($parsed['path'] ?? '').($parsed['query'] ?? '' ? '?'.$parsed['query'] : '');

                return $requestOrigin.$pathOnly;
            }
        }

        return $storageUrl;
    }
}
