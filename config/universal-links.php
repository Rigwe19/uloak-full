<?php

/**
 * Deep links for share pages (Expo native app + PWA).
 *
 * HTTPS share URLs are the canonical deep links — when the native app is
 * installed and verified, iOS/Android open them directly in the app
 * (Universal Links / App Links). The custom scheme below powers the
 * "Open in app" buttons as a fallback.
 *
 * Expo (app.json) side — set the same values there:
 *   ios: { bundleIdentifier: IOS_BUNDLE_ID, associatedDomains: ["applinks:www.uloofstories.com"] }
 *   android: { package: ANDROID_PACKAGE, intentFilters: [{ action: "VIEW", category: ["BROWSABLE","DEFAULT"], data: [{ scheme: "https", host: "www.uloofstories.com", pathPrefix: "/share/" }] }] }
 *   scheme: APP_SCHEME
 *
 * Until ANDROID_SHA256_FINGERPRINTS / IOS_BUNDLE_ID are filled, the
 * well-known endpoints serve empty claims (file exists, open the URLs
 * in the browser) so provisioning can be validated later.
 */
$bundleId = trim((string) env('IOS_BUNDLE_ID', ''));
$package = trim((string) env('ANDROID_PACKAGE', ''));

$fingerprints = collect(explode(',', (string) env('ANDROID_SHA256_FINGERPRINTS', '')))
    ->map(fn ($fp) => trim(strtoupper($fp)))
    ->filter()
    ->values()
    ->all();

$paths = ['/share/rooms/*', '/share/events/*', '/creators/*'];

return [
    'scheme' => env('APP_SCHEME', 'ulo'),

    'ios' => [
        'bundle_id' => $bundleId,
        // Apple App ID = TEAM_ID.BUNDLE_ID (config/IOS_TEAM_ID optional).
        'team_id' => trim((string) env('IOS_TEAM_ID', '')),
        'app_id' => $bundleId !== ''
            ? (env('IOS_TEAM_ID') ? trim((string) env('IOS_TEAM_ID', '')).'.'.$bundleId : $bundleId)
            : '',
        'paths' => $paths,
    ],

    'android' => [
        'package' => $package,
        'fingerprints' => $fingerprints,
        'paths' => $paths,
    ],
];
