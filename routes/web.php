<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\StoryController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'welcome'])->name('home');
Route::get('/about', [PageController::class, 'show'])->defaults('slug', 'about')->name('about');
Route::get('/how-it-works', [PageController::class, 'show'])->defaults('slug', 'how-it-works')->name('how-it-works');
Route::get('/legacy-films', [PageController::class, 'show'])->defaults('slug', 'legacy-films')->name('legacy-films');
Route::get('/community-projects', [PageController::class, 'show'])->defaults('slug', 'community-projects')->name('community-projects');
Route::get('/contact', [PageController::class, 'show'])->defaults('slug', 'contact')->name('contact');
Route::get('/privacy', [PageController::class, 'show'])->defaults('slug', 'privacy')->name('privacy');
Route::get('/membership', [PageController::class, 'show'])->defaults('slug', 'membership')->name('membership');

// Guest Sharing & Magic Link Gateway Routes
Route::get('/share/rooms/{slug}', [ShareController::class, 'showRoom'])->name('share.rooms.show');
Route::get('/share/events/{slug}', [ShareController::class, 'showEvent'])->name('share.events.show');
Route::post('/share/send-link', [ShareController::class, 'sendMagicLink'])->name('share.send-link');
Route::get('/magic-login', [ShareController::class, 'magicLogin'])->name('magic.login');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::resource('rooms', RoomController::class)->only(['show', 'store']);
        Route::post('rooms/{room}/stories', [StoryController::class, 'store'])->name('rooms.stories.store');
        Route::resource('events', EventController::class)->only(['show', 'store']);
        Route::post('events/{event}/stories', [EventController::class, 'storeStory'])->name('events.stories.store');
        Route::get('stories/{story}', [StoryController::class, 'show'])->name('stories.show');
        Route::post('stories/{story}/comments', [CommentController::class, 'store'])->name('stories.comments.store');
        Route::post('stories/{story}/assets', [StoryController::class, 'addAsset'])->name('stories.assets.store');
        Route::get('search', [SearchController::class, 'index'])->name('search');
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
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
    });
});

require __DIR__.'/settings.php';
