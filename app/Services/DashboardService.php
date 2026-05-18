<?php

namespace App\Services;

use App\Models\Story;
use App\Models\User;

class DashboardService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getDashboardData(User $user): array
    {
        $rooms = $user->rooms()
            ->with(['members'])
            ->withCount([
                'stories',
                'stories as photos_count' => function ($query) {
                    $query->where('type', 'photo');
                },
                'stories as videos_count' => function ($query) {
                    $query->where('type', 'video');
                },
                'stories as audios_count' => function ($query) {
                    $query->where('type', 'audio');
                },
                'stories as documents_count' => function ($query) {
                    $query->where('type', 'document');
                },
            ])
            ->get();

        $recentStories = Story::whereIn('room_id', $rooms->pluck('id'))
            ->with(['user', 'room'])
            ->latest()
            ->take(5)
            ->get();

        $stats = [
            ['name' => 'Photos', 'icon' => 'Camera', 'count' => Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'photo')->count()],
            ['name' => 'Videos', 'icon' => 'Video', 'count' => Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'video')->count()],
            ['name' => 'Stories', 'icon' => 'MessageSquare', 'count' => Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'audio')->count()],
            ['name' => 'Family Members', 'icon' => 'Share2', 'count' => $user->rooms()->withCount('members')->get()->unique('id')->sum('members_count')],
            ['name' => 'Documents', 'icon' => 'Files', 'count' => Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'document')->count()],
        ];
        // dd($stats);

        return [
            'rooms' => $rooms,
            'recentStories' => $recentStories->map(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'thumbnail' => $story->thumbnail,
                'type' => $story->type,
                'date' => $story->created_at->format('M d, Y'),
            ]),
            'stats' => $stats,
            'notifications' => $user->notifications()->take(5)->get(),
        ];
    }
}
