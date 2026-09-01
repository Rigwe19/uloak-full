<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description"
        content="{{ \Illuminate\Support\Str::limit($page['props']['meta_description'] ?? 'Preserve your family stories, heritage, and memories with Ulo of Stories.', 155) }}">

    {{-- Facebook Open Graph --}}
    <meta property="og:title" content="{{ $page['props']['title'] ?? 'Ulo of Stories' }}" />
    <meta property="og:description"
        content="{{ \Illuminate\Support\Str::limit($page['props']['meta_description'] ?? 'Preserve your family stories, heritage, and memories with Ulo of Stories.', 125) }}" />
    <meta property="og:image" content="{{ asset($page['props']['meta_image'] ?? url('/images/og-image.webp')) }}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="{{ $page['props']['meta_url'] ?? url()->current() }}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="{{ config('app.name', 'Ulo of Stories') }}" />
    <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}" />

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $page['props']['title'] ?? 'Ulo of Stories' }}" />
    <meta name="twitter:description"
        content="{{ \Illuminate\Support\Str::limit($page['props']['meta_description'] ?? 'Preserve your family stories, heritage, and memories with Ulo of Stories.', 125) }}" />
    <meta name="twitter:image" content="{{ asset($page['props']['meta_image'] ?? url('/images/og-image.webp')) }}" />

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function () {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: #F2EDE0;
        }

        html.dark {
            background-color: #0b0b0b;
        }
    </style>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">

    @fonts

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    <x-inertia::head>
        <title>{{ $page['props']['title'] ?? config('app.name', 'Ulo of Stories') }}</title>
    </x-inertia::head>

    {{-- Service Worker for Web Push Notifications --}}
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/webpush-worker.js');
            });
        }
    </script>
</head>

<body class="font-sans antialiased">
    <x-inertia::app />
</body>

</html>