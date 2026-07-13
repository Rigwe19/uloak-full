<?php

use App\Http\Controllers\MediaController;
use App\Http\Controllers\MediaUploadController;
use App\Http\Controllers\MediaWebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->prefix('api')->group(function () {
    Route::post('/media/images/upload', [MediaController::class, 'uploadImage'])->name('api.media.images.upload');
    Route::post('/media/videos/upload', [MediaController::class, 'uploadVideo'])->name('api.media.videos.upload');
    Route::post('/webhooks/cloudinary', [MediaWebhookController::class, 'handleCloudinary'])->name('api.webhooks.cloudinary');
    Route::get('/media/{uuid}', [MediaController::class, 'show'])->name('api.media.show');
    Route::post('/media/{uuid}/process', [MediaController::class, 'processImage'])->name('api.media.process');
    Route::delete('/media/{uuid}', [MediaController::class, 'destroy'])->name('api.media.destroy');
});

Route::post('/api/media/video/sign', [MediaUploadController::class, 'signVideo'])
    ->middleware(['web', 'auth:sanctum'])
    ->name('api.media.video.sign');

Route::post('/api/media/sign', [MediaUploadController::class, 'sign'])
    ->middleware(['web', 'auth:sanctum'])
    ->name('api.media.sign');

Route::get('/media/image/{uuid}/{size}.{format}', [MediaController::class, 'serveImage'])
    ->where('size', '\d+x\d+')
    ->where('format', 'webp|jpeg|jpg|png')
    ->name('media.image.serve');
