<?php

namespace App\Console\Commands;

use App\Models\CloudinaryUsage;
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
use Illuminate\Support\Facades\Http;

#[Signature('analytics:aggregate {--date= : The date to aggregate (Y-m-d). Defaults to yesterday.} {--force : Overwrite existing record}')]
#[Description('Aggregate daily analytics into platform_metrics and cloudinary_usage tables')]
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

        $this->aggregateCloudinaryUsage($dateStr, $force);

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
                'avg_processing_time_ms' => $avgProcessingTime ? round((float) $avgProcessingTime, 2) : null,
            ],
        );

        $this->info("  Platform metrics: {$totalViews} views, {$uploads} uploads, {$newUsers} new users");
    }

    protected function aggregateCloudinaryUsage(string $dateStr, bool $force): void
    {
        if (CloudinaryUsage::where('date', $dateStr)->exists() && ! $force) {
            $this->warn("  Cloudinary usage for {$dateStr} already exists. Use --force to overwrite.");

            return;
        }

        $cloudinaryUrl = config('services.cloudinary.api_url');
        $cloudinaryKey = config('services.cloudinary.api_key');
        $cloudinarySecret = config('services.cloudinary.api_secret');
        $cloudinaryCloud = config('services.cloudinary.cloud_name');

        if (! $cloudinaryKey || ! $cloudinarySecret || ! $cloudinaryCloud) {
            $this->warn('  Cloudinary API not configured. Skipping Cloudinary usage aggregation.');

            return;
        }

        try {
            $response = Http::withBasicAuth($cloudinaryKey, $cloudinarySecret)
                ->get("https://api.cloudinary.com/v1_1/{$cloudinaryCloud}/usage");

            if ($response->failed()) {
                $this->warn('  Failed to fetch Cloudinary usage data. Skipping.');

                return;
            }

            $usage = $response->json();

            CloudinaryUsage::updateOrCreate(
                ['date' => $dateStr],
                [
                    'storage_bytes' => $usage['storage']['bytes'] ?? 0,
                    'bandwidth_bytes' => $usage['bandwidth']['bytes'] ?? 0,
                    'transformations' => $usage['transformations']['count'] ?? 0,
                    'derived_assets' => $usage['derived_assets']['count'] ?? 0,
                    'credits_used' => $usage['credits']['usage'] ?? 0,
                    'credits_remaining' => $usage['credits']['limit'] ?? null,
                    'raw_api_response' => $usage,
                ],
            );

            $this->info('  Cloudinary usage aggregated successfully.');
        } catch (\Exception $e) {
            $this->warn("  Failed to aggregate Cloudinary usage: {$e->getMessage()}");
        }
    }
}
