<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Image Driver
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default image driver that should be used for
    | all image manipulations. Laravel Image supports "gd" and "imagick".
    | Both extensions have their own unique features, so feel free to
    | choose the one that best fits your application's needs.
    |
    | Supported: "gd", "imagick"
    |
    */

    'driver' => env('IMAGE_DRIVER', 'imagick'),

];
