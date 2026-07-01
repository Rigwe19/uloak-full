<?php

namespace App\Services;

use App\Models\Room;
use App\Models\Story;
use App\Models\Tribute;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DashboardService
{
    public function getDashboardData(User $user): array
    {
        $userRooms = $this->getRoomsWithCounts(
            $user->rooms()->with(['members'])
        );

        $adminRooms = $this->getRoomsWithCounts(
            Room::whereHas('creator', function ($query) {
                $query->where('is_admin', true);
            })->with(['members', 'creator'])
        );

        // Merge user rooms with admin rooms, deduplicating by id
        $rooms = $userRooms->merge($adminRooms)->unique('id')->values();

        $recentStories = Story::whereIn('room_id', $rooms->pluck('id'))
            ->with(['user', 'room'])
            ->latest()
            ->take(5)
            ->get();
        $photo_count = Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'photo')->count('id') + Tribute::whereIn('room_id', $rooms->pluck('id'))->whereJsonLength('images', '>', 2)->count('id');
        $stats = [
            ['name' => 'Photos', 'icon' => 'Camera', 'count' => $photo_count],
            ['name' => 'Videos', 'icon' => 'Video', 'count' => Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'video')->count('id')],
            ['name' => 'Stories', 'icon' => 'MessageSquare', 'count' => Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'audio')->count('id')],
            ['name' => 'Family Members', 'icon' => 'Share2', 'count' => $user->rooms()->withCount('members')->get()->unique('members.id')->sum('members_count')],
            ['name' => 'Documents', 'icon' => 'Files', 'count' => Story::whereIn('room_id', $rooms->pluck('id'))->where('type', 'document')->count('id')],
            ['name' => 'Tributes', 'icon' => 'MessageSquare', 'count' => Tribute::whereIn('room_id', $rooms->pluck('id'))->count('id')],
        ];

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
            'notifications' => [], // $user->notifications()->take(5)->get(),
        ];
    }

    private function getRoomsWithCounts($query): Collection
    {
        return $query
            ->withCount([
                'stories',
                'tributes',
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
    }
}
