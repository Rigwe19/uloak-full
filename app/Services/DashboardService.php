<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Room;
use App\Models\Story;
use App\Models\Tribute;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class DashboardService
{
    public function getDashboardData(User $user): array
    {
        $userRooms = $this->getRoomsWithCounts(
            Room::where(function ($query) use ($user) {
                $query->whereIn('id', $user->rooms()->select('rooms.id'))
                    ->orWhere('created_by', $user->id);
            })->with(['members'])
        );

        $adminRooms = $this->getRoomsWithCounts(
            Room::whereHas('creator', function ($query) {
                $query->where('is_admin', true);
            })->with(['members', 'creator'])
        );

        // Merge user rooms with admin rooms, deduplicating by id
        $rooms = $userRooms->merge($adminRooms)->unique('id')->values();

        // Load user's events
        $events = Event::where('created_by', $user->id)
            ->withCount('stories')
            ->latest()
            ->get();

        $houseMembers = $user->houseMembers()->latest()->get();

        $houseMemberData = $houseMembers->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'avatar' => $m->avatar,
        ]);

        $rooms->each(function ($room) use ($houseMemberData) {
            $existingIds = $room->members->pluck('id')->toArray();
            $membersToAdd = $houseMemberData->reject(fn ($hm) => in_array($hm['id'], $existingIds));
            $room->setRelation('members', $room->members->concat($membersToAdd));
        });

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
            'events' => $events,
            'recentStories' => $recentStories->map(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'thumbnail' => $story->thumbnail ? Storage::disk('public')->url($story->thumbnail) : null,
                'type' => $story->type,
                'date' => $story->created_at->format('M d, Y'),
                'author' => $story->user?->name ?? $story->guest_name,
                'description' => $story->description,
                'file_url' => $story->file_url ? Storage::disk('public')->url($story->file_url) : null,
                'assets' => $story->assets ?? [],
            ]),
            'stats' => $stats,
            'house_members' => $houseMemberData,
            'notifications' => [],
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
