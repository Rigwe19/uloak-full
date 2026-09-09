<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SearchRequest;
use App\Http\Resources\RoomResource;
use App\Http\Resources\StoryResource;
use App\Models\Room;
use App\Models\Story;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function index(SearchRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $q = $validated['q'];
        $type = $validated['type'] ?? 'all';

        $user = $request->user();
        $roomIds = $user ? Room::where(function ($query) use ($user) {
            $query->where('status', 'active')->orWhereIn('id', $user->rooms()->select('rooms.id'));
        })->pluck('id') : collect();

        $rooms = collect();
        $stories = collect();

        if (in_array($type, ['all', 'rooms'], true)) {
            $rooms = Room::whereIn('id', $roomIds)
                ->where(fn ($query) => $query->where('name', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"))
                ->withCount(['stories', 'tributes'])->limit(20)->get();
        }

        if (in_array($type, ['all', 'stories'], true)) {
            $stories = Story::whereIn('room_id', $roomIds)
                ->where(fn ($query) => $query->where('title', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"))
                ->with(['user', 'room'])->limit(20)->get();
        }

        return response()->json([
            'data' => [
                'rooms' => RoomResource::collection($rooms),
                'stories' => StoryResource::collection($stories),
                'query' => $q,
            ],
        ]);
    }
}
