<?php

namespace App\Console\Commands;

use App\Models\Comment;
use App\Models\MediaView;
use App\Models\PlatformMetric;
use App\Models\ProcessingLog;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('analytics:aggregate {--date= : The date to aggregate (Y-m-d). Defaults to yesterday.} {--force : Overwrite existing record}')]
#[Description('Aggregate daily analytics into platform_metrics tables')]
class AggregateAnalytics extends Command
{
    public function handle()
    {
        $date = $this->option('date')
            ? CarbonImmutable::parse($this->option('date'))
            : CarbonImmutable::yesterday();

        $dateStr = $date->toDateString();
        $force = $this->option('force');

        if (PlatformMetric::where('date', $dateStr)->exists() && ! $force) {
            $this->warn("Platform metrics for {$dateStr} already exist. Use --force to overwrite.");

            return self::SUCCESS;
        }

        $this->info("Aggregating analytics for {$dateStr}...");

        $this->aggregatePlatformMetrics($date, $dateStr, $force);

        $this->info('Done.');

        return self::SUCCESS;
    }

    protected function aggregatePlatformMetrics(CarbonImmutable $date, string $dateStr, bool $force): void
    {
        $dayStart = $date->startOfDay();
        $dayEnd = $date->endOfDay();

        $newUsers = User::whereBetween('created_at', [$dayStart, $dayEnd])->count();
        $totalUsers = User::count();
        $uploads = Story::whereBetween('created_at', [$dayStart, $dayEnd])->count();
        $newRooms = Room::whereBetween('created_at', [$dayStart, $dayEnd])->count();
        $activeRooms = Room::whereHas('stories', fn ($q) => $q->whereBetween('created_at', [$dayStart, $dayEnd]))->count();
        $comments = Comment::whereBetween('created_at', [$dayStart, $dayEnd])->count();

        $views = MediaView::whereBetween('created_at', [$dayStart, $dayEnd]);
        $totalViews = (clone $views)->count();
        $uniqueViewers = (clone $views)->whereNotNull('ip_hash')
            ->distinct('ip_hash')
            ->count('ip_hash');
        $watchTime = (clone $views)->sum('watch_time');

        $processingJobs = ProcessingLog::whereBetween('created_at', [$dayStart, $dayEnd]);
        $totalJobs = (clone $processingJobs)->count();
        $failedJobs = (clone $processingJobs)->where('to_state', 'failed')->count();
        $avgProcessingTime = ProcessingLog::whereBetween('created_at', [$dayStart, $dayEnd])
            ->whereNotNull('duration_ms')
            ->avg('duration_ms');

        PlatformMetric::updateOrCreate(
            ['date' => $dateStr],
            [
                'new_users' => $newUsers,
                'total_users' => $totalUsers,
                'uploads' => $uploads,
                'views' => $totalViews,
                'unique_viewers' => $uniqueViewers,
                'watch_time_seconds' => $watchTime,
                'active_rooms' => $activeRooms,
                'new_rooms' => $newRooms,
                'processing_jobs' => $totalJobs,
                'failed_jobs' => $failedJobs,
                'comments' => $comments,
                'avg_processing_time_ms' => round((float) ($avgProcessingTime ?? 0), 2),
            ],
        );

        $this->info("  Platform metrics: {$totalViews} views, {$uploads} uploads, {$newUsers} new users");
    }
}
