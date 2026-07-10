<?php

use App\Http\Controllers\AnalyticsController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->prefix('api')->group(function (): void {
    Route::post('/analytics/{story}/view', [AnalyticsController::class, 'view'])
        ->name('api.analytics.view');
    Route::post('/analytics/{story}/playback', [AnalyticsController::class, 'playback'])
        ->name('api.analytics.playback');
});
