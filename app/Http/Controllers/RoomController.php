<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Services\RoomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function __construct(
        protected RoomService $roomService
    ) {}

    public function show(Room $room): Response
    {
        $room = $this->roomService->getRoomDetails($room);
        $room->loadCount('stories');

        return Inertia::render('dashboard/rooms/show', [
            'room' => $room,
            'stories' => $room->stories->map(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'thumbnail' => $story->thumbnail,
                'type' => $story->type,
                'description' => $story->description,
                'author' => $story->user->name,
                'tags' => $story->tags ?? [],
                'date' => $story->created_at->format('M d, Y'),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('rooms/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $room = $this->roomService->createRoom($request->user(), $validated);

        return redirect()->route('dashboard.rooms.show', $room);
    }
}
