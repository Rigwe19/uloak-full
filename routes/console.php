<?php

use App\Jobs\UpdateStoriesWithPendingMedia;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:send-media-upload-reminders')->dailyAt('07:00');
Schedule::command('analytics:aggregate')->dailyAt('03:00');
Schedule::command('downloads:clean-expired')->dailyAt('02:00');
Schedule::command('rooms:close-expired-starters')->dailyAt('01:00');
Schedule::job(UpdateStoriesWithPendingMedia::class)->everyFiveMinutes();
