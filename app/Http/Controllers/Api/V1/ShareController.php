<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Http\Resources\StoryResource;
use App\Models\Room;
use App\Services\GuestStoryAccess;
use App\Services\PersonArchiveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    public function __construct(
        protected PersonArchiveService $personArchive,
        protected GuestStoryAccess $guestAccess,
    ) {}

    public function showRoom(Request $request, string $slug): JsonResponse
    {
        $room = Room::where('slug', $slug)->withCount(['stories', 'tributes'])->firstOrFail();
        $guest = $this->guestAccess->resolve($request, $room);
        $viewer = $request->user();
        $isFiltered = $this->guestAccess->isFiltered($viewer, $room);

        $storiesQuery = $this->personArchive->storiesQuery($room);
        $storiesQuery = $this->guestAccess->applyPrivateFilter($storiesQuery, $viewer, $room, $guest);

        $stories = $storiesQuery->latest()->with(['user'])->cursorPaginate(24);
        $this->personArchive->enrichStoriesWithPeople($stories->getCollection());

        foreach ($stories->getCollection() as $story) {
            $canModify = $this->guestAccess->canGuestModifyStory($story, $viewer, $guest);
            $story->setAttribute('can_edit', $canModify);
            $story->setAttribute('can_delete', $canModify);
        }

        $archive = $this->personArchive->meta($room);
        if ($isFiltered) {
            $archive = null;
        }

        return response()->json([
            'data' => [
                'room' => new RoomResource($room),
                'stories' => StoryResource::collection($stories->getCollection()),
                'pagination' => ['next_cursor' => $stories->nextCursor()?->encode(), 'per_page' => $stories->perPage()],
                'archive' => $archive,
            ],
        ]);
    }
}
