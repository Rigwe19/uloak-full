<?php

use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\AssemblyAIWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/assemblyai', [AssemblyAIWebhookController::class, 'handle']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/feed', FeedController::class)->name('api.feed');
    Route::post('/drive/import', [\App\Http\Controllers\DriveImportController::class, 'download'])->name('api.drive.import');
});

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
