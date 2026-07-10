<?php

use App\Http\Controllers\PersonController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('people')->name('people.')->group(function () {
    Route::get('create', [PersonController::class, 'create'])->name('create');
    Route::post('/', [PersonController::class, 'store'])->name('store');

    Route::prefix('{person}')->group(function () {
        Route::get('/', [PersonController::class, 'show'])->name('show');
        Route::get('about', [PersonController::class, 'about'])->name('about');
        Route::get('family-tree', [PersonController::class, 'familyTree'])->name('family-tree');
        Route::get('timeline', [PersonController::class, 'timeline'])->name('timeline');
        Route::get('stories', [PersonController::class, 'stories'])->name('stories');
        Route::get('media', [PersonController::class, 'media'])->name('media');
        Route::get('heritage', [PersonController::class, 'heritage'])->name('heritage');
        Route::get('memories', [PersonController::class, 'memories'])->name('memories');
        Route::get('permissions', [PersonController::class, 'permissions'])->name('permissions');
        Route::get('activity', [PersonController::class, 'activity'])->name('activity');
        Route::get('edit', [PersonController::class, 'edit'])->name('edit');
        Route::put('/', [PersonController::class, 'update'])->name('update');
    });
});
