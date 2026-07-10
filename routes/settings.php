<?php

use App\Http\Controllers\HouseMemberController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/about');
    Route::redirect('settings/profile', '/settings/about');

    // Person section
    Route::get('settings/about', [PersonController::class, 'settingsAbout'])->name('settings.about');
    Route::get('settings/family-tree', [PersonController::class, 'settingsFamilyTree'])->name('settings.family-tree');
    Route::get('settings/timeline', [PersonController::class, 'settingsTimeline'])->name('settings.timeline');
    Route::get('settings/stories', [PersonController::class, 'settingsStories'])->name('settings.stories');
    Route::get('settings/media', [PersonController::class, 'settingsMedia'])->name('settings.media');
    Route::get('settings/heritage', [PersonController::class, 'settingsHeritage'])->name('settings.heritage');
    Route::get('settings/memories', [PersonController::class, 'settingsMemories'])->name('settings.memories');
    Route::get('settings/permissions', [PersonController::class, 'settingsPermissions'])->name('settings.permissions');
    Route::get('settings/activity', [PersonController::class, 'settingsActivity'])->name('settings.activity');
    Route::put('settings/person', [PersonController::class, 'settingsUpdate'])->name('settings.person.update');

    // Danger Zone
    Route::get('settings/danger-zone', function () {
        return Inertia::render('settings/danger-zone', [
            'title' => 'Danger Zone - Uloak',
        ]);
    })->name('settings.danger-zone');

    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');
    Route::get('settings/house', [HouseMemberController::class, 'edit'])->name('house.edit');

    Route::get('settings/house/members', [HouseMemberController::class, 'index'])->name('house.members');
    Route::post('settings/house/members', [HouseMemberController::class, 'store'])->name('house.members.store');
    Route::delete('settings/house/members/{member}', [HouseMemberController::class, 'destroy'])->name('house.members.destroy');
    Route::post('settings/house/members/{member}/regenerate-token', [HouseMemberController::class, 'regenerateToken'])->name('house.members.regenerate-token');
    Route::post('settings/house/thumbnail', [HouseMemberController::class, 'updateThumbnail'])->name('house.thumbnail');
    Route::post('settings/house/pattern', [HouseMemberController::class, 'updatePattern'])->name('house.pattern');
    Route::post('settings/house/pattern-upload', [HouseMemberController::class, 'updatePatternUpload'])->name('house.pattern-upload');
    Route::delete('settings/house/pattern-upload', [HouseMemberController::class, 'clearPatternUpload'])->name('house.pattern-upload.clear');

    Route::get('settings/privacy', function () {
        return Inertia::render('settings/privacy', [
            'title' => 'Privacy Settings - Uloak',
        ]);
    })->name('privacy.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance', [
            'title' => 'Appearance Settings - Uloak',
        ]);
    })->name('appearance.edit');
});
