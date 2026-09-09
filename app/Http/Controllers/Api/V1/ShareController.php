<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Http\Resources\StoryResource;
use App\Models\Room;
use Illuminate\Http\JsonResponse;

class ShareController extends Controller
{
    public function showRoom(string $slug): JsonResponse
    {
        $room = Room::where('slug', $slug)->withCount(['stories', 'tributes'])->firstOrFail();
        $stories = $room->stories()->latest()->with(['user'])->cursorPaginate(24);

        return response()->json([
            'data' => [
                'room' => new RoomResource($room),
                'stories' => StoryResource::collection($stories->getCollection()),
                'pagination' => ['next_cursor' => $stories->nextCursor()?->encode(), 'per_page' => $stories->perPage()],
            ],
        ]);
    }
}
