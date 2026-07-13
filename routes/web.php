<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FamilyController;
use App\Http\Controllers\HouseAccessController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\TributeController;
use App\Http\Controllers\WaitingListController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'welcome'])->name('home');
Route::get('/about', [PageController::class, 'show'])->defaults('slug', 'about')->name('about');
Route::get('/how-it-works', [PageController::class, 'show'])->defaults('slug', 'how-it-works')->name('how-it-works');
Route::get('/services', [PageController::class, 'show'])->defaults('slug', 'legacy-films')->name('legacy-films');
Route::get('/community-projects', [PageController::class, 'show'])->defaults('slug', 'community-projects')->name('community-projects');
Route::get('/contact', [PageController::class, 'show'])->defaults('slug', 'contact')->name('contact');
Route::get('/privacy', [PageController::class, 'show'])->defaults('slug', 'privacy')->name('privacy');
Route::get('/membership', [PageController::class, 'show'])->defaults('slug', 'membership')->name('membership');

// Waiting List
Route::get('/waiting-list', [WaitingListController::class, 'index'])->name('waiting-list.index');
Route::post('/waiting-list', [WaitingListController::class, 'store'])->name('waiting-list.store');

// Guest Sharing & Magic Link Gateway Routes
Route::get('/share/rooms/{slug}', [ShareController::class, 'showRoom'])->name('share.rooms.show');
Route::get('/share/events/{slug}', [ShareController::class, 'showEvent'])->name('share.events.show');
Route::post('/share/send-link', [ShareController::class, 'sendMagicLink'])->name('share.send-link');
Route::post('/share/rooms/{room}/tributes', [TributeController::class, 'store'])->name('share.rooms.tributes.store');
Route::post('/share/rooms/{room}/candles', [TributeController::class, 'lightCandle'])->name('share.rooms.candles.store');
Route::post('/share/rooms/{room}/stories', [ShareController::class, 'storeRoomContribution'])->name('share.rooms.stories.store');
Route::post('/share/rooms/{room}/stories/followup', [ShareController::class, 'storeRoomFollowUpMedia'])->name('share.rooms.stories.followup');
Route::post('/share/rooms/{room}/subscribe', [ShareController::class, 'storeGuestSubscription'])->name('share.rooms.subscribe');
Route::post('/share/rooms/{room}/comments', [ShareController::class, 'storeRoomComment'])->name('share.rooms.comments.store');
Route::delete('/share/rooms/{room}/stories/{story}', [ShareController::class, 'destroyStory'])->name('share.rooms.stories.destroy');
Route::post('/share/events/{event}/contributions', [ShareController::class, 'storeEventContribution'])->name('share.events.contributions.store');
Route::get('/magic-login', [ShareController::class, 'magicLogin'])->name('magic.login');
Route::get('/rooms/{room}/download-media', [RoomController::class, 'downloadMedia'])->name('rooms.download-media');

// Family Member Access Routes (token-based, no password)
Route::get('/family/access/{token}', [FamilyController::class, 'accessViaToken'])->name('family.access');
Route::get('/family/logout', [FamilyController::class, 'logout'])->name('family.logout');

// House Member Access Routes (token-based, no password)
Route::get('/house/access/{token}', [HouseAccessController::class, 'accessViaToken'])->name('house.access');
Route::get('/house/logout', [HouseAccessController::class, 'logout'])->name('house.logout');

// House Member Routes (middleware: house-member)
Route::middleware(['house-member'])->prefix('house')->name('house.')->group(function () {
    Route::get('/dashboard', [HouseAccessController::class, 'dashboard'])->name('dashboard');
    Route::get('/settings', [HouseAccessController::class, 'settings'])->name('settings');
    Route::post('/settings', [HouseAccessController::class, 'updateProfile'])->name('settings.update');
    Route::post('/settings/preferences', [HouseAccessController::class, 'updatePreferences'])->name('settings.preferences');
    Route::post('/settings/leave', [HouseAccessController::class, 'leaveHouse'])->name('settings.leave');
    Route::get('/rooms/{room}', [HouseAccessController::class, 'showRoom'])->name('rooms.show');
    Route::post('/rooms', [HouseAccessController::class, 'storeRoom'])->name('rooms.store');
    Route::post('/rooms/{room}', [HouseAccessController::class, 'updateRoom'])->name('rooms.update');
    Route::post('/rooms/{room}/stories', [HouseAccessController::class, 'storeStory'])->name('rooms.stories.store');
    Route::delete('/rooms/{room}', [HouseAccessController::class, 'destroyRoom'])->name('rooms.destroy');
    Route::patch('/tributes/{tribute}/approve', [TributeController::class, 'approve'])->name('tributes.approve');
    Route::patch('/candles/{candle}/approve', [TributeController::class, 'approveCandle'])->name('candles.approve');
    Route::delete('/tributes/{tribute}', [TributeController::class, 'destroy'])->name('tributes.destroy');
});

Route::middleware(['family-member'])->prefix('family')->name('family.')->group(function () {
    Route::get('/dashboard', [FamilyController::class, 'dashboard'])->name('dashboard');
    Route::get('/rooms/{room}', [FamilyController::class, 'showRoom'])->name('rooms.show');
    Route::post('/rooms/{room}/stories', [FamilyController::class, 'storeStory'])->name('rooms.stories.store');
    Route::delete('/rooms/{room}/stories/{story}', [FamilyController::class, 'destroyStory'])->name('rooms.stories.destroy');
});

Route::get('/push-public-key', [PushSubscriptionController::class, 'publicKey']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store']);
});

// Socialite Authentication
Route::prefix('auth')->name('auth.')->group(function () {
    Route::get('/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('socialite.redirect');
    Route::get('/{provider}/callback', [SocialiteController::class, 'callback'])->name('socialite.callback');
});

// Passkeys listing for settings page
Route::middleware(['auth'])->group(function () {
    Route::get('/user/passkeys', function (Request $request) {
        return response()->json([
            'passkeys' => $request->user()->passkeys()->orderBy('created_at', 'desc')->get(),
        ]);
    })->name('passkey.index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::resource('rooms', RoomController::class)->only(['show', 'store', 'update']);
        Route::get('rooms/{room}/feed', [RoomController::class, 'feed'])->name('rooms.feed');

        // Family member management
        Route::get('rooms/{room}/members', [RoomController::class, 'members'])->name('rooms.members');
        Route::post('rooms/{room}/members', [RoomController::class, 'storeMember'])->name('rooms.members.store');
        Route::delete('rooms/{room}/members/{member}', [RoomController::class, 'destroyMember'])->name('rooms.members.destroy');
        Route::post('rooms/{room}/members/{member}/regenerate-token', [RoomController::class, 'regenerateMemberToken'])->name('rooms.members.regenerate-token');

        Route::post('rooms/{room}/stories', [StoryController::class, 'store'])->name('rooms.stories.store');
        Route::post('rooms/{room}/tributes', [TributeController::class, 'store'])->name('rooms.tributes.store');
        Route::get('rooms/{room}/tributes', [TributeController::class, 'index'])->name('rooms.tributes.index');
        Route::get('rooms/{room}/tributes/pending', [TributeController::class, 'pending'])->name('rooms.tributes.pending');
        Route::patch('tributes/{tribute}/approve', [TributeController::class, 'approve'])->name('tributes.approve');
        Route::patch('candles/{candle}/approve', [TributeController::class, 'approveCandle'])->name('candles.approve');
        Route::delete('tributes/{tribute}', [TributeController::class, 'destroy'])->name('tributes.destroy');
        Route::resource('events', EventController::class)->only(['show', 'store']);
        Route::post('events/{event}/stories', [EventController::class, 'storeStory'])->name('events.stories.store');
        Route::get('stories/{story}', [StoryController::class, 'show'])->name('stories.show');
        Route::get('stories/{story}/data', [StoryController::class, 'showData'])->name('stories.data');
        Route::delete('stories/{story}', [StoryController::class, 'destroy'])->name('stories.destroy');
        Route::post('stories/{story}/comments', [CommentController::class, 'store'])->name('stories.comments.store');
        Route::post('stories/{story}/assets', [StoryController::class, 'addAsset'])->name('stories.assets.store');
        Route::get('search', [SearchController::class, 'index'])->name('search');
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

        Route::get('analytics', [DashboardController::class, 'analytics'])->name('analytics');
    });

    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::get('/rooms', [AdminController::class, 'rooms'])->name('rooms');
        Route::get('/enquiries', [AdminController::class, 'enquiries'])->name('enquiries');
        Route::get('/pages', [AdminController::class, 'pages'])->name('pages');
        Route::get('/pages/{page}/edit', [AdminController::class, 'editPage'])->name('pages.edit');
        Route::patch('/pages/{page}', [AdminController::class, 'updatePage'])->name('pages.update');
        Route::post('/upload-image', [AdminController::class, 'uploadImage'])->name('upload-image');
        Route::get('/memberships', [AdminController::class, 'memberships'])->name('memberships');
        Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs');

        Route::get('/analytics', [AdminAnalyticsController::class, 'index'])->name('analytics');
        Route::get('/analytics/data', [AdminAnalyticsController::class, 'data'])->name('analytics.data');
        Route::get('/analytics/platform', [AdminAnalyticsController::class, 'platform'])->name('analytics.platform');
        Route::get('/analytics/cloudinary', [AdminAnalyticsController::class, 'cloudinary'])->name('analytics.cloudinary');
        Route::get('/analytics/realtime', [AdminAnalyticsController::class, 'realtime'])->name('analytics.realtime');
        Route::get('/analytics/export', [AdminAnalyticsController::class, 'export'])->name('analytics.export');
    });
});

require __DIR__.'/people.php';
require __DIR__.'/settings.php';
