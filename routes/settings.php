<?php

use App\Http\Controllers\HouseMemberController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
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
