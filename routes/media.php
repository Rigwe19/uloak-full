<?php

use App\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->prefix('api')->group(function () {
    Route::post('/media/images/upload', [MediaController::class, 'uploadImage'])->name('api.media.images.upload');
    Route::post('/media/videos/upload', [MediaController::class, 'uploadVideo'])->name('api.media.videos.upload');
    Route::get('/media/{uuid}', [MediaController::class, 'show'])->name('api.media.show');
    Route::post('/media/{uuid}/process', [MediaController::class, 'processImage'])->name('api.media.process');
    Route::delete('/media/{uuid}', [MediaController::class, 'destroy'])->name('api.media.destroy');
});

Route::get('/media/image/{uuid}/{size}.{format}', [MediaController::class, 'serveImage'])
    ->where('size', '\d+x\d+')
    ->where('format', 'webp|jpeg|jpg|png')
    ->name('media.image.serve');
