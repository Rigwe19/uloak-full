<?php

use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\V1\AuthController as V1AuthController;
use App\Http\Controllers\Api\V1\BillingController as V1BillingController;
use App\Http\Controllers\Api\V1\DashboardController as V1DashboardController;
use App\Http\Controllers\Api\V1\HouseAccessController as V1HouseAccessController;
use App\Http\Controllers\Api\V1\NotificationController as V1NotificationController;
use App\Http\Controllers\Api\V1\RoomController as V1RoomController;
use App\Http\Controllers\Api\V1\SearchController as V1SearchController;
use App\Http\Controllers\Api\V1\ShareController as V1ShareController;
use App\Http\Controllers\Api\V1\StoryController as V1StoryController;
use App\Http\Controllers\AssemblyAIWebhookController;
use App\Http\Controllers\DriveImportController;
use App\Http\Controllers\LikeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Webhooks (no auth, outside versioning)
|--------------------------------------------------------------------------
*/
Route::post('/webhooks/assemblyai', [AssemblyAIWebhookController::class, 'handle']);

/*
|--------------------------------------------------------------------------
| API v1 — Mobile (Sanctum bearer)
| Base URL: {APP_URL}/api/v1
| Auth: Authorization: Bearer <sanctum_token> (from POST /login or Fortify)
| All responses: JSON with { data, message, pagination, ... } — see API.md
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Legacy aliases (keep /api/feed working for existing tests/clients)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/feed', FeedController::class)->name('api.feed.legacy');
    Route::post('/drive/import', [DriveImportController::class, 'download'])->name('api.drive.import.legacy');
});

Route::prefix('v1')->group(function () {
    // Public (no auth) — pricing + guest share (must be fetchable without login)
    Route::get('/pricing', [V1BillingController::class, 'pricing'])->name('api.v1.pricing');
    Route::get('/share/rooms/{slug}', [V1ShareController::class, 'showRoom'])->name('api.v1.share.rooms.show');

    // Auth — public (Sanctum token issuance)
    Route::post('/login', [V1AuthController::class, 'login'])->middleware('throttle:login')->name('api.v1.login');
    Route::post('/register', [V1AuthController::class, 'register'])->middleware('throttle:6,1')->name('api.v1.register');

    // Authenticated
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::get('/me', [V1AuthController::class, 'me'])->name('api.v1.me');
        Route::post('/logout', [V1AuthController::class, 'logout'])->name('api.v1.logout');

        // Dashboard + Analytics (mobile home)
        Route::get('/dashboard', [V1DashboardController::class, 'index'])->name('api.v1.dashboard');
        Route::get('/analytics', [V1DashboardController::class, 'analytics'])->name('api.v1.analytics');

        // Rooms — mirrors RoomController web but JSON via Resources + StoreRoomRequest/UpdateRoomRequest
        Route::get('/rooms', [V1RoomController::class, 'index'])->name('api.v1.rooms.index');
        Route::post('/rooms', [V1RoomController::class, 'store'])->name('api.v1.rooms.store');
        Route::get('/rooms/{room}', [V1RoomController::class, 'show'])->name('api.v1.rooms.show');
        Route::put('/rooms/{room}', [V1RoomController::class, 'update'])->name('api.v1.rooms.update');
        Route::patch('/rooms/{room}', [V1RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [V1RoomController::class, 'destroy'])->name('api.v1.rooms.destroy');

        // Stories (per room) + single story + processing status
        Route::get('/rooms/{room}/stories', [V1StoryController::class, 'index'])->name('api.v1.rooms.stories.index');
        Route::post('/rooms/{room}/stories', [V1StoryController::class, 'store'])->middleware(['contributions.open', 'throttle:guest-media'])->name('api.v1.rooms.stories.store');
        Route::get('/stories/{story}', [V1StoryController::class, 'show'])->name('api.v1.stories.show');
        Route::delete('/stories/{story}', [V1StoryController::class, 'destroy'])->name('api.v1.stories.destroy');
        Route::get('/stories/{story}/processing-status', [V1StoryController::class, 'processingStatus'])->name('api.v1.stories.processing-status');

        // Feed / Reels — vertical video (Story type=video), cursor pagination
        Route::get('/rooms/{room}/feed', [V1RoomController::class, 'feed'])->name('api.v1.rooms.feed');
        Route::get('/feed', FeedController::class)->name('api.v1.feed'); // legacy: ?room=&cursor=
        Route::post('/drive/import', [DriveImportController::class, 'download'])->name('api.v1.drive.import');

        // Search
        Route::get('/search', [V1SearchController::class, 'index'])->name('api.v1.search');

        // Notifications
        Route::get('/notifications', [V1NotificationController::class, 'index'])->name('api.v1.notifications.index');
        Route::post('/notifications/{id}/read', [V1NotificationController::class, 'markAsRead'])->name('api.v1.notifications.read');
        Route::post('/notifications/read-all', [V1NotificationController::class, 'markAllAsRead'])->name('api.v1.notifications.read-all');

        // House access (family vault) — token verify + CRUD
        Route::post('/house/verify', [V1HouseAccessController::class, 'verify'])->name('api.v1.house.verify');
        Route::get('/house/members', [V1HouseAccessController::class, 'index'])->name('api.v1.house.members.index');
        Route::post('/house/members', [V1HouseAccessController::class, 'store'])->name('api.v1.house.members.store');
        Route::delete('/house/members/{houseMember}', [V1HouseAccessController::class, 'destroy'])->name('api.v1.house.members.destroy');

        // Billing — checkout create + status polling + verify (idempotent)
        Route::post('/billing/checkout', [V1BillingController::class, 'checkout'])->name('api.v1.billing.checkout');
        Route::get('/billing/payments/{payment}/status', [V1BillingController::class, 'status'])->name('api.v1.billing.status');
        Route::post('/billing/payments/{payment}/verify', [V1BillingController::class, 'verify'])->name('api.v1.billing.verify');

        // Likes (re-use web LikeController logic — keep simple for mobile)
        Route::post('/stories/{story}/likes', [LikeController::class, 'toggle'])->name('api.v1.stories.likes.toggle');
        Route::get('/stories/{story}/likes/status', [LikeController::class, 'status'])->name('api.v1.stories.likes.status');
    });
});
