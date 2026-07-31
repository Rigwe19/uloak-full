<?php

use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\AssemblyAIWebhookController;
use App\Http\Controllers\DriveImportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/assemblyai', [AssemblyAIWebhookController::class, 'handle']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/feed', FeedController::class)->name('api.feed');
    Route::post('/drive/import', [DriveImportController::class, 'download'])->name('api.drive.import');
});

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
