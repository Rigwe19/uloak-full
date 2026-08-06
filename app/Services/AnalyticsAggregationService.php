<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\MediaEvent;
use App\Models\MediaSession;
use App\Models\MediaView;
use App\Models\PlatformMetric;
use App\Models\ProcessingLog;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class AnalyticsAggregationService
{
    public function mediaStats(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $views = MediaView::whereBetween('created_at', [$start, $end]);

        $totalViews = (clone $views)->count();
        $uniqueViewers = (clone $views)->whereNotNull('ip_hash')
            ->distinct('ip_hash')
            ->count('ip_hash');
        $totalWatchTime = (clone $views)->sum('watch_time');
        $completedViews = (clone $views)->where('completed', true)->count();

        $uploads = Story::whereBetween('created_at', [$start, $end])->count();

        $viewsOverTime = (clone $views)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->pluck('count', 'date');

        $uploadsOverTime = Story::whereBetween('created_at', [$start, $end])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->pluck('count', 'date');

        $topStories = MediaView::whereBetween('media_views.created_at', [$start, $end])
            ->select('story_id', DB::raw('COUNT(*) as views'), DB::raw('SUM(watch_time) as total_watch_time'))
            ->groupBy('story_id')
            ->orderByDesc('views')
            ->limit(10)
            ->with('story:id,title')
            ->get()
            ->map(fn ($v) => [
                'id' => $v->story_id,
                'title' => $v->story?->title ?? 'Deleted',
                'views' => $v->views,
                'watch_time' => (int) $v->total_watch_time,
            ]);

        $completionRate = $totalViews > 0
            ? round(($completedViews / $totalViews) * 100, 1)
            : 0;

        return [
            'total_views' => $totalViews,
            'unique_viewers' => $uniqueViewers,
            'total_watch_time' => $totalWatchTime,
            'completed_views' => $completedViews,
            'completion_rate' => $completionRate,
            'uploads' => $uploads,
            'views_over_time' => $viewsOverTime,
            'uploads_over_time' => $uploadsOverTime,
            'top_stories' => $topStories,
        ];
    }

    public function userStats(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $newUsers = User::whereBetween('created_at', [$start, $end])->count();
        $totalUsers = User::count();

        $activeUsers = MediaEvent::whereBetween('created_at', [$start, $end])
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $guestViewers = MediaView::whereBetween('created_at', [$start, $end])
            ->whereNull('user_id')
            ->distinct('ip_hash')
            ->count('ip_hash');

        $sessions = MediaSession::whereBetween('created_at', [$start, $end])->count();

        $topContributorsRaw = Story::whereBetween('created_at', [$start, $end])
            ->whereNotNull('user_id')
            ->select('user_id', DB::raw('COUNT(*) as stories'))
            ->groupBy('user_id')
            ->orderByDesc('stories')
            ->limit(10)
            ->get();

        $contributorIds = $topContributorsRaw->pluck('user_id')->filter();
        $contributors = User::whereIn('id', $contributorIds)->get()->keyBy('id');

        $topContributors = $topContributorsRaw->map(fn ($s) => [
            'id' => $s->user_id,
            'name' => $contributors->get($s->user_id)?->name ?? 'Deleted',
            'avatar' => $contributors->get($s->user_id)?->avatar_url ?? null,
            'stories' => $s->stories,
        ]);

        $usersOverTime = User::whereBetween('created_at', [$start, $end])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->pluck('count', 'date');

        return [
            'new_users' => $newUsers,
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'guest_viewers' => $guestViewers,
            'sessions' => $sessions,
            'top_contributors' => $topContributors,
            'users_over_time' => $usersOverTime,
        ];
    }

    public function roomStats(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $totalRooms = Room::count();
        $newRooms = Room::whereBetween('created_at', [$start, $end])->count();
        $activeRooms = Room::whereHas('stories', fn ($q) => $q->whereBetween('created_at', [$start, $end]))->count();

        $topRoomIds = MediaView::whereBetween('media_views.created_at', [$start, $end])
            ->join('stories', 'media_views.story_id', '=', 'stories.id')
            ->select('stories.room_id', DB::raw('COUNT(*) as views'), DB::raw('SUM(media_views.watch_time) as watch_time'))
            ->groupBy('stories.room_id')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        $roomIds = $topRoomIds->pluck('room_id')->filter();
        $rooms = Room::whereIn('id', $roomIds)->get()->keyBy('id');

        $topRooms = $topRoomIds->map(fn ($v) => [
            'id' => $v->room_id,
            'name' => $rooms->get($v->room_id)?->name ?? 'Deleted',
            'slug' => $rooms->get($v->room_id)?->slug ?? null,
            'views' => $v->views,
            'watch_time' => (int) $v->watch_time,
        ]);

        $uploadRoomStats = Story::whereBetween('created_at', [$start, $end])
            ->select('room_id', DB::raw('COUNT(*) as uploads'))
            ->groupBy('room_id')
            ->orderByDesc('uploads')
            ->limit(10)
            ->get();

        $uploadRoomIds = $uploadRoomStats->pluck('room_id')->filter();
        $uploadRooms = Room::whereIn('id', $uploadRoomIds)->get()->keyBy('id');

        $roomUploads = $uploadRoomStats->map(fn ($s) => [
            'id' => $s->room_id,
            'name' => $uploadRooms->get($s->room_id)?->name ?? 'Deleted',
            'slug' => $uploadRooms->get($s->room_id)?->slug ?? null,
            'uploads' => $s->uploads,
        ]);

        return [
            'total_rooms' => $totalRooms,
            'new_rooms' => $newRooms,
            'active_rooms' => $activeRooms,
            'top_rooms' => $topRooms,
            'room_uploads' => $roomUploads,
        ];
    }

    public function platformMetrics(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $metrics = PlatformMetric::whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date')
            ->get();

        $totals = [
            'new_users' => $metrics->sum('new_users'),
            'uploads' => $metrics->sum('uploads'),
            'views' => $metrics->sum('views'),
            'unique_viewers' => $metrics->sum('unique_viewers'),
            'watch_time_seconds' => $metrics->sum('watch_time_seconds'),
            'active_rooms' => $metrics->max('active_rooms'),
            'new_rooms' => $metrics->sum('new_rooms'),
            'processing_jobs' => $metrics->sum('processing_jobs'),
            'failed_jobs' => $metrics->sum('failed_jobs'),
            'comments' => $metrics->sum('comments'),
            'likes' => $metrics->sum('likes'),
            'storage_bytes' => $metrics->last()?->storage_bytes ?? 0,
        ];

        $latest = PlatformMetric::latest('date')->first();

        return [
            'daily' => $metrics,
            'totals' => $totals,
            'latest' => $latest,
        ];
    }

    public function processingHealth(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $total = ProcessingLog::whereBetween('created_at', [$start, $end])->count();
        $success = ProcessingLog::whereBetween('created_at', [$start, $end])
            ->where('to_state', 'ready')
            ->count();
        $failed = ProcessingLog::whereBetween('created_at', [$start, $end])
            ->where('to_state', 'failed')
            ->count();

        $avgDuration = ProcessingLog::whereBetween('created_at', [$start, $end])
            ->whereNotNull('duration_ms')
            ->avg('duration_ms');

        $failuresOverTime = ProcessingLog::whereBetween('created_at', [$start, $end])
            ->where('to_state', 'failed')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->pluck('count', 'date');

        $recentFailures = ProcessingLog::whereBetween('created_at', [$start, $end])
            ->where('to_state', 'failed')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'media_id' => $log->media_id,
                'media_name' => 'Unknown',
                'exception' => $log->exception,
                'retry_count' => $log->retry_count,
                'created_at' => $log->created_at,
            ]);

        $successRate = $total > 0
            ? round(($success / $total) * 100, 1)
            : 0;

        return [
            'total_jobs' => $total,
            'successful' => $success,
            'failed' => $failed,
            'success_rate' => $successRate,
            'avg_duration_ms' => $avgDuration ? round((float) $avgDuration, 0) : null,
            'failures_over_time' => $failuresOverTime,
            'recent_failures' => $recentFailures,
        ];
    }

    public function cloudinaryUsage(CarbonImmutable $start, CarbonImmutable $end): array
    {
        // This method is deprecated - Cloudinary has been removed
        return [
            'daily' => collect(),
            'totals' => [
                'storage_bytes' => 0,
                'bandwidth_bytes' => 0,
                'transformations' => 0,
                'credits_used' => 0,
            ],
            'latest' => null,
            'trends' => collect(),
        ];
    }

    public function realTimeStats(): array
    {
        $activeSessions = MediaSession::where('last_activity_at', '>=', now()->subMinutes(5))->count();
        $viewsToday = MediaView::whereDate('created_at', today())->count();
        $uploadsToday = Story::whereDate('created_at', today())->count();
        $usersToday = User::whereDate('created_at', today())->count();
        $processingNow = ProcessingLog::whereNull('duration_ms')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        return [
            'active_sessions' => $activeSessions,
            'views_today' => $viewsToday,
            'uploads_today' => $uploadsToday,
            'users_today' => $usersToday,
            'processing_now' => $processingNow,
        ];
    }

    public function creatorStats(User $user, CarbonImmutable $start, CarbonImmutable $end): array
    {
        $storyIds = Story::where('user_id', $user->id)
            ->whereBetween('created_at', [$start, $end])
            ->pluck('id');

        $totalStories = $storyIds->count();
        $totalViews = MediaView::whereIn('story_id', $storyIds)
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $totalWatchTime = MediaView::whereIn('story_id', $storyIds)
            ->whereBetween('created_at', [$start, $end])
            ->sum('watch_time');
        $totalComments = Comment::whereIn('story_id', $storyIds)
            ->whereBetween('created_at', [$start, $end])
            ->count();
        $uniqueViewers = MediaView::whereIn('story_id', $storyIds)
            ->whereBetween('created_at', [$start, $end])
            ->whereNotNull('ip_hash')
            ->distinct('ip_hash')
            ->count('ip_hash');

        $storyBreakdown = Story::where('user_id', $user->id)
            ->whereBetween('created_at', [$start, $end])
            ->withCount(['comments' => fn ($q) => $q->whereBetween('created_at', [$start, $end])])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'type' => $story->type,
                'created_at' => $story->created_at->toIso8601String(),
                'views_count' => MediaView::where('story_id', $story->id)
                    ->whereBetween('created_at', [$start, $end])
                    ->count(),
                'comments_count' => $story->comments_count,
            ]);

        $viewsOverTime = MediaView::whereIn('story_id', $storyIds)
            ->whereBetween('created_at', [$start, $end])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->pluck('count', 'date');

        $uploadsOverTime = Story::where('user_id', $user->id)
            ->whereBetween('created_at', [$start, $end])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->pluck('count', 'date');

        return [
            'total_stories' => $totalStories,
            'total_views' => $totalViews,
            'total_watch_time' => $totalWatchTime,
            'total_comments' => $totalComments,
            'unique_viewers' => $uniqueViewers,
            'story_breakdown' => $storyBreakdown,
            'views_over_time' => $viewsOverTime,
            'uploads_over_time' => $uploadsOverTime,
        ];
    }
}
