<?php

return [

    'image' => [
        'driver' => env('MEDIA_IMAGE_DRIVER', 'gd'),
        'cache_disk' => env('MEDIA_CACHE_DISK', 'public'),
        'quality' => env('MEDIA_IMAGE_QUALITY', 80),
        'paths' => [
            'originals' => 'media/originals',
            'cache' => 'media/cache',
        ],
        'default_format' => env('MEDIA_IMAGE_FORMAT', 'webp'),
    ],

    'video' => [
        'driver' => env('MEDIA_VIDEO_DRIVER', 'cloudinary'),
        'paths' => [
            'processed' => 'media/processed',
            'thumbnails' => 'media/thumbnails',
        ],
    ],

    'storage' => [
        'disk' => env('MEDIA_DISK', 'public'),
    ],

    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key' => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
        'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET', 'uloak_video'),
        'webhook_secret' => env('CLOUDINARY_WEBHOOK_SECRET'),
        'max_file_size' => env('CLOUDINARY_MAX_FILE_SIZE', 1073741824),
        'upload_url' => env('CLOUDINARY_UPLOAD_URL'),
        'eager_transformations' => [
            [
                'width' => 'auto',
                'crop' => 'limit',
                'quality' => 'auto',
                'format' => 'auto',
            ],
            [
                'width' => 640,
                'height' => 360,
                'crop' => 'fill',
                'quality' => 'auto',
                'format' => 'auto',
            ],
        ],
        'transformations' => [
            'thumbnail' => [
                'width' => 640,
                'height' => 360,
                'crop' => 'fill',
                'quality' => 'auto',
                'format' => 'jpg',
            ],
            'preview' => [
                'width' => 640,
                'height' => 360,
                'crop' => 'fill',
                'quality' => 'auto',
                'format' => 'webp',
                'video_codec' => 'auto',
                'duration' => 5,
                'start_offset' => 1,
            ],
        ],
    ],

];
