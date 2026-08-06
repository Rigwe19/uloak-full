<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomMember;
use App\Models\Story;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class FamilyController extends Controller
{
    /**
     * Access a room via a token (no password, no email).
     */
    public function accessViaToken(string $token): RedirectResponse
    {
        $member = RoomMember::where('access_token', $token)->firstOrFail();

        // Store in session — no User model needed
        session()->put('family_member_id', $member->id);
        session()->put('family_member_name', $member->name);
        session()->put('family_member_email', $member->email);

        return redirect()->route('family.dashboard');
    }

    /**
     * Show the family member dashboard with all rooms they have access to.
     */
    public function dashboard(): InertiaResponse
    {
        $memberId = session('family_member_id');
        $member = RoomMember::findOrFail($memberId);

        // Get ALL rooms this member has access to (same email can be in multiple rooms)
        $roomIds = RoomMember::where('email', $member->email)
            ->pluck('room_id');

        $rooms = Room::whereIn('id', $roomIds)
            ->withCount('stories')
            ->latest()
            ->get()
            ->map(fn ($room) => [
                'id' => $room->id,
                'slug' => $room->slug,
                'name' => $room->name,
                'description' => $room->description,
                'thumbnail' => $room->thumbnail,
                'stories_count' => $room->stories_count,
                'room_type' => $room->room_type,
            ]);

        return Inertia::render('family/dashboard', [
            'rooms' => $rooms,
            'memberName' => session('family_member_name'),
            'memberEmail' => session('family_member_email'),
        ]);
    }

    /**
     * Show a specific room to the family member.
     */
    public function showRoom(Room $room): InertiaResponse
    {
        $memberId = session('family_member_id');

        // Verify this member has access to this room
        $member = RoomMember::where('id', $memberId)
            ->where('room_id', $room->id)
            ->firstOrFail();

        $paginator = $room->stories()
            ->whereNull('follow_up_to')
            ->with(['comments' => function ($q) {
                $q->latest();
            }, 'followUpStories'])
            ->latest()
            ->cursorPaginate(24)
            ->through(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'type' => $story->type,
                'description' => $story->description,
                'author' => $story->user?->name ?? $story->roomMember?->name ?? $story->getGuestName() ?? 'Anonymous',
                'thumbnail' => $story->thumbnail,
                'file_url' => $story->file_url,
                'assets' => $story->assets ?? [],
                'room_member_id' => $story->room_member_id,
                'comments' => $story->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'content' => $c->content,
                    'author' => $c->authorName(),
                    'date' => $c->created_at->diffForHumans(),
                ]),
                'comments_count' => $story->comments()->count(),
                'follow_ups' => $story->followUpStories->map(fn ($fs) => [
                    'id' => $fs->id,
                    'type' => $fs->type,
                    'file_url' => $fs->file_url,
                    'thumbnail' => $fs->thumbnail,
                    'author' => $fs->user?->name ?? $fs->roomMember?->name ?? $fs->getGuestName() ?? 'Anonymous',
                    'created_at' => $fs->created_at->format('M d, Y'),
                ]),
                'date' => $story->created_at->format('M d, Y'),
                'tags' => $story->tags ?? [],
            ]);

        return Inertia::render('family/rooms/show', [
            'room' => [
                'id' => $room->id,
                'slug' => $room->slug,
                'name' => $room->name,
                'description' => $room->description,
                'thumbnail' => $room->thumbnail,
                'room_type' => $room->room_type,
            ],
            'stories' => $paginator->items(),
            'pagination' => [
                'next_cursor' => $paginator->nextCursor()?->encode(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
            ],
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'relationship' => $member->relationship,
            ],
            'title' => $room->name.' - Ulo of Stories',
        ]);
    }

    /**
     * Store a story as a family member.
     */
    public function storeStory(Request $request, Room $room): RedirectResponse
    {
        $memberId = session('family_member_id');

        // Verify membership
        $member = RoomMember::where('id', $memberId)
            ->where('room_id', $room->id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'recording' => ['nullable', 'file', 'max:51200'],
        ]);

        $fileUrl = null;
        $assets = [];

        if ($request->hasFile('recording')) {
            $recording = $request->file('recording');
            $path = $recording->store('stories/rooms/'.$room->id.'/family-media', 'public');
            $fileUrl = Storage::url($path);
            $type = $validated['type'];
            $validated['type'] = $type;
            $assets[] = [
                'url' => $fileUrl,
                'type' => $type,
                'title' => $recording->getClientOriginalName(),
            ];
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('stories/rooms/'.$room->id.'/family-assets', 'public');
                $url = Storage::url($path);
                $mime = $file->getMimeType();
                $type = 'photo';
                if (str_contains($mime, 'video')) {
                    $type = 'video';
                } elseif (str_contains($mime, 'audio')) {
                    $type = 'audio';
                }
                $assets[] = [
                    'url' => $url,
                    'type' => $type,
                    'title' => $file->getClientOriginalName(),
                ];
                if (! $fileUrl) {
                    $fileUrl = $url;
                    $validated['type'] = $type;
                }
            }
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('stories/rooms/'.$room->id.'/family-thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $thumbnail = null;
        if (isset($validated['thumbnail'])) {
            $thumbnail = $validated['thumbnail'];
        } elseif ($validated['type'] === 'photo') {
            $thumbnail = $fileUrl;
        }

        Story::create([
            'room_id' => $room->id,
            'room_member_id' => $member->id,
            'guest_name' => $member->name,
            'guest_email' => $member->email,
            'title' => $validated['title'] ?? ($validated['type'] === 'video' ? 'Video Recording' : ($validated['type'] === 'audio' ? 'Audio Recording' : 'Photo')),
            'type' => $validated['type'],
            'description' => $validated['description'] ?? '',
            'file_url' => $fileUrl,
            'thumbnail' => $thumbnail,
            'assets' => $assets,
            'tags' => ['family-contribution'],
        ]);

        return redirect()->back()->with('success', 'Your memory has been shared!');
    }

    /**
     * Delete a story — only if the family member owns it.
     */
    public function destroyStory(Room $room, Story $story): RedirectResponse
    {
        $memberId = session('family_member_id');

        // Verify membership
        RoomMember::where('id', $memberId)
            ->where('room_id', $room->id)
            ->firstOrFail();

        // Only allow deleting own stories
        if ($story->room_member_id !== $memberId) {
            abort(403, 'You can only delete your own stories.');
        }

        $story->delete();

        return redirect()->back()->with('success', 'Story deleted.');
    }

    /**
     * Logout from family member session.
     */
    public function logout(): RedirectResponse
    {
        session()->forget(['family_member_id', 'family_member_name', 'family_member_email']);

        return redirect()->route('home');
    }
}
