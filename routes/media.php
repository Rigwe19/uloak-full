<?php

use App\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->prefix('api')->group(function () {
    Route::post('/media/upload', [MediaController::class, 'upload'])->name('api.media.upload');
    Route::post('/media/images/upload', [MediaController::class, 'uploadImage'])->name('api.media.images.upload');
    Route::post('/media/videos/upload', [MediaController::class, 'uploadVideo'])->name('api.media.videos.upload');
    // Guest parity (ephemeral, rate-limited, watermarked via same LocalFfmpegVideoProcessor)
    Route::middleware('throttle:guest-media')->group(function () {
        Route::post('/media/guest/videos/upload', [MediaController::class, 'uploadGuestVideo'])->name('api.media.guest.videos.upload');
        Route::post('/media/guest/images/upload', [MediaController::class, 'uploadGuestImage'])->name('api.media.guest.images.upload');
        Route::post('/media/guest/upload', [MediaController::class, 'uploadGuest'])->name('api.media.guest.upload');
    });
    Route::get('/media/{uuid}', [MediaController::class, 'show'])->name('api.media.show');
    Route::post('/media/{uuid}/process', [MediaController::class, 'processImage'])->name('api.media.process');
    Route::delete('/media/{uuid}', [MediaController::class, 'destroy'])->name('api.media.destroy');
});

Route::get('/media/image/{uuid}/{size}.{format}', [MediaController::class, 'serveImage'])
    ->where('size', '\d+x\d+')
    ->where('format', 'webp|jpeg|jpg|png')
    ->name('media.image.serve');
