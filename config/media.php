<?php

return [

    'image' => [
        'driver' => env('MEDIA_IMAGE_DRIVER', 'imagick'),
        'cache_disk' => env('MEDIA_CACHE_DISK', 'public'),
        'quality' => env('MEDIA_IMAGE_QUALITY', 80),
        'paths' => [
            'originals' => 'media/originals',
            'cache' => 'media/cache',
        ],
        'default_format' => env('MEDIA_IMAGE_FORMAT', 'webp'),
    ],

    'video' => [
        'driver' => env('MEDIA_VIDEO_DRIVER', 'ffmpeg'),
        'paths' => [
            'processed' => 'media/processed',
            'thumbnails' => 'media/thumbnails',
        ],
    ],

    'storage' => [
        'disk' => env('MEDIA_DISK', 'public'),
    ],

];
