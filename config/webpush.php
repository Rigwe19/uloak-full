<?php

return [
    /*
    |--------------------------------------------------------------------------
    | VAPID Settings
    |--------------------------------------------------------------------------
    |
    | VAPID (Voluntary Application Server Identification) keys are used
    | to identify your server when sending push notifications. Generate them
    | using the artisan command `php artisan webpush:vapid` and paste the
    | results here.
    |
    */
    'vapid' => [
        'subject' => env('VAPID_SUBJECT', 'mailto:you@example.com'),
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Notification Options
    |--------------------------------------------------------------------------
    |
    | These options will be merged with each WebPushMessage you send.
    |
    */
    'default_options' => [
        'TTL' => 2419200, // 4 weeks in seconds
    ],
];
