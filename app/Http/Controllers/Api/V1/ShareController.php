<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Http\Resources\StoryResource;
use App\Models\Room;
use App\Services\PersonArchiveService;
use Illuminate\Http\JsonResponse;

class ShareController extends Controller
{
    public function __construct(protected PersonArchiveService $personArchive) {}

    public function showRoom(string $slug): JsonResponse
    {
        $room = Room::where('slug', $slug)->withCount(['stories', 'tributes'])->firstOrFail();
        $stories = $this->personArchive->storiesQuery($room)->latest()->with(['user'])->cursorPaginate(24);
        $this->personArchive->enrichStoriesWithPeople($stories->getCollection());

        return response()->json([
            'data' => [
                'room' => new RoomResource($room),
                'stories' => StoryResource::collection($stories->getCollection()),
                'pagination' => ['next_cursor' => $stories->nextCursor()?->encode(), 'per_page' => $stories->perPage()],
                'archive' => $this->personArchive->meta($room),
            ],
        ]);
    }
}
