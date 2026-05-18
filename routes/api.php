<?php

use App\Http\Controllers\AssemblyAIWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/assemblyai', [AssemblyAIWebhookController::class, 'handle']);

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
