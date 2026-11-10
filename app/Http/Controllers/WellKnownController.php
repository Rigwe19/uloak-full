<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class WellKnownController extends Controller
{
    /**
     * iOS Universal Links verification.
     * GET /.well-known/apple-app-site-association
     */
    public function appleAppSiteAssociation(): JsonResponse
    {
        $ios = config('universal-links.ios');

        $appId = (string) ($ios['app_id'] ?? '');
        $paths = (array) ($ios['paths'] ?? ['/share/rooms/*', '/share/events/*']);

        if ($appId === '') {
            return response()->json(['applinks' => ['details' => []]]);
        }

        $components = array_map(
            fn (string $path) => ['#' => $path],
            $paths
        );

        return response()->json([
            'applinks' => [
                'details' => [
                    [
                        'appIDs' => [$appId],
                        'components' => $components,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Android App Links verification.
     * GET /.well-known/assetlinks.json
     */
    public function assetLinks(): JsonResponse
    {
        $android = config('universal-links.android');

        $package = (string) ($android['package'] ?? '');
        $fingerprints = (array) ($android['fingerprints'] ?? []);

        if ($package === '' || $fingerprints === []) {
            return response()->json([]);
        }

        return response()->json([
            [
                'relation' => ['delegate_permission/common.handle_all_urls'],
                'target' => [
                    'namespace' => 'android_app',
                    'package_name' => $package,
                    'sha256_cert_fingerprints' => $fingerprints,
                ],
            ],
        ]);
    }
}
