<?php

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
    Route::get('settings/house', function () {
        return Inertia::render('settings/house', [
            'title' => 'House Settings - Uloak',
        ]);
    })->name('house.edit');

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
