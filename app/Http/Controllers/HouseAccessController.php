<?php

namespace App\Http\Controllers;

use App\Enums\RoomTier;
use App\Models\HouseMember;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\RoomService;
use App\Services\StoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class HouseAccessController extends Controller
{
    public function __construct(
        protected ActivityLogger $activityLogger,
        protected StoryService $storyService,
    ) {}

    // public function accessViaToken(string $token): RedirectResponse
    // {
    //     $member = HouseMember::where('access_token', $token)->firstOrFail();

    //     $owner = User::findOrFail($member->house_owner_id);

    //     session([
    //     'house_member_id' => $member->id,
    //     'house_member_name' => $member->name,
    //     'house_owner_id' => $member->owner_id,

    //     'meta_title' => "{$owner->name} Family House - Ulo of Stories",
    //     'meta_description' => Str::limit(
    //         $owner->description ?: 'View and share memories in my house.',
    //         155
    //     ),
    //     'meta_image' => $owner->house_thumbnail_url ?? url('/images/og-image.webp'),
    //     'meta_url' => route('house.dashboard'),
    // ]);

    //     return redirect()->route('house.dashboard');
    // }
    public function accessViaToken(string $token)
    {
        $member = HouseMember::where('access_token', $token)->firstOrFail();
        $owner = $member->owner;

        session([
            'house_member_id' => $member->id,
            'house_member_name' => $member->name,
            'house_owner_id' => $member->owner_id,
        ]);

        return view('invite', [
            'owner' => $owner,
            'redirect' => route('house.dashboard'),
        ]);
    }

    public function logout(): RedirectResponse
    {
        session()->forget(['house_member_id', 'house_member_name', 'house_owner_id']);

        return redirect()->route('home');
    }

    public function dashboard(): Response
    {
        $ownerId = session('house_owner_id');
        $houseMemberId = session('house_member_id');

        $owner = User::findOrFail($ownerId);

        $allHouseMemberIds = HouseMember::where('owner_id', $ownerId)
            ->pluck('id')
            ->push($houseMemberId)
            ->unique()
            ->values()
            ->toArray();

        $rooms = Room::where(function ($query) use ($ownerId, $allHouseMemberIds) {
            $query->where('created_by', $ownerId)
                ->orWhereIn('created_by_house_member_id', $allHouseMemberIds);
        })
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
            ->with(['members', 'creator'])
            ->latest()
            ->get()
            ->map(fn ($room) => [
                ...$room->toArray(),
                'can_delete' => $room->created_by_house_member_id === $houseMemberId,
            ]);

        $totalPhotos = $rooms->sum('photos_count');
        $totalVideos = $rooms->sum('videos_count');
        $totalAudios = $rooms->sum('audios_count');
        $totalDocuments = $rooms->sum('documents_count');
        $totalMembers = $rooms->pluck('members')->flatten(1)->unique('id')->count();

        $stats = [
            ['name' => 'Photos', 'icon' => 'Camera', 'count' => $totalPhotos],
            ['name' => 'Videos', 'icon' => 'Video', 'count' => $totalVideos],
            ['name' => 'Voices', 'icon' => 'MessageSquare', 'count' => $totalAudios],
            ['name' => 'Members', 'icon' => 'Share2', 'count' => $totalMembers],
            ['name' => 'Documents', 'icon' => 'Files', 'count' => $totalDocuments],
        ];

        $recentStories = Story::whereIn('room_id', $rooms->pluck('id'))
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'thumbnail' => $story->thumbnail,
                'type' => $story->type,
                'author' => $story->user?->name ?? $story->guest_name,
                'date' => $story->created_at->format('M d, Y'),
            ]);

        return Inertia::render('house/dashboard', [
            // 'title' => 'House Dashboard - Ulo of Stories',
            'rooms' => $rooms,
            'recentStories' => $recentStories,
            'stats' => $stats,
            'owner_name' => $owner->name,
            'house_member_name' => session('house_member_name'),
            'house_thumbnail' => $owner->house_thumbnail_url,
            'house_pattern' => $owner->house_pattern,
            'title' => $owner->name.' Family House - Ulo of Stories',
            'meta_description' => $owner->description
                ? Str::limit($owner->description, 155)
                : 'View and share memories in my house as a member.',
            'meta_image' => $owner->house_thumbnail ?? url('/images/og-image.webp'),
            'meta_url' => url()->route('house.dashboard'),
        ]);
    }

    public function showRoom(Room $room): Response
    {
        $ownerId = session('house_owner_id');
        $houseMemberId = session('house_member_id');

        $this->authorizeHouseAccess($room, $ownerId);

        $room->loadCount('stories');
        $pendingTributes = $room->tributes()->where('is_approved', false)->latest()->get();
        $approvedTributes = $room->tributes()->where('is_approved', true)->latest()->get();
        $allTributes = $room->tributes;

        $pageTitle = $room->name.' - Ulo of Stories';

        return Inertia::render('house/rooms/show', [
            'title' => $pageTitle,
            'room' => [
                ...$room->toArray(),
                'can_delete' => $room->created_by_house_member_id === $houseMemberId,
                'can_edit' => $room->created_by_house_member_id === $houseMemberId,
            ],
            'pendingTributes' => $pendingTributes,
            'approvedTributes' => $approvedTributes,
            'allTributes' => $allTributes,
            'stories' => $room->stories->map(fn ($story) => [
                'uuid' => $story->uuid,
                'id' => $story->id,
                'title' => $story->title,
                'thumbnail' => $story->thumbnail,
                'type' => $story->type,
                'description' => $story->description,
                'author' => $story->user?->name ?? $story->guest_name,
                'tags' => $story->tags ?? [],
                'date' => $story->created_at->format('M d, Y'),
                'file_url' => $story->file_url,
                'assets' => $story->assets ?? [],
            ]),
            'candles' => $room->candles()->orderByRaw('CASE WHEN is_approved = false THEN 0 ELSE 1 END')->get(),
        ]);
    }

    public function storeRoom(Request $request): RedirectResponse
    {
        $ownerId = session('house_owner_id');
        $houseMemberId = session('house_member_id');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'privacy' => ['required', 'string', 'in:public,private'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'room_type' => ['nullable', 'string', 'in:general,birthday,burial,wedding,anniversary,memorial,graduation'],
            'enable_tributes' => ['nullable', 'boolean'],
            'enable_condolence_attendance' => ['nullable', 'boolean'],
            'enable_candle_lighting' => ['nullable', 'boolean'],
            'tribute_name' => ['nullable', 'string', 'max:255'],
            'tribute_song' => ['nullable', 'file', 'mimes:mp3,wav,ogg', 'max:10240'],
            'media_items' => ['nullable', 'array'],
            'media_items.*' => ['file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm', 'max:10240'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'tier_type' => ['nullable', 'string', 'in:starter,full_room,family_archive'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('rooms/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        if ($request->hasFile('tribute_song')) {
            $path = $request->file('tribute_song')->store('rooms/tribute-songs', 'public');
            $validated['tribute_song'] = Storage::url($path);
        }

        if ($request->hasFile('media_items')) {
            $mediaUrls = [];
            foreach ($request->file('media_items') as $file) {
                $path = $file->store('rooms/media', 'public');
                $mediaUrls[] = [
                    'url' => Storage::url($path),
                    'type' => str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image',
                ];
            }
            $validated['media_items'] = $mediaUrls;
        }

        // House follows the same paywall as dashboard: only "general" is free.
        $paywalledTypes = ['wedding', 'birthday', 'burial', 'memorial', 'anniversary', 'graduation'];
        $requestedType = $validated['room_type'] ?? 'general';
        $requestedTier = $validated['tier_type'] ?? null;
        if (in_array($requestedType, $paywalledTypes, true) || $requestedTier === 'full_room' || $requestedTier === 'family_archive') {
            return redirect()->route('weddings.create', ['type' => $requestedType !== 'general' ? $requestedType : 'wedding'])->with('info', 'This occasion requires a paid Full Room — pick the type and checkout at the same price.');
        }

        $owner = User::findOrFail($ownerId);
        $tier = RoomTier::tryFrom($validated['tier_type'] ?? RoomTier::Starter->value) ?? RoomTier::Starter;
        unset($validated['tier_type']);

        // Enforce tier gating via RoomService (1 active Starter per owner; full_room/family_archive blocked here).
        try {
            $room = app(RoomService::class)->createRoom($owner, [
                ...$validated,
                'tier_type' => $tier->value,
                'created_by_house_member_id' => $houseMemberId,
                'slug' => Str::slug($validated['name']).'-'.Str::random(6),
            ], $tier);
        } catch (ValidationException $e) {
            throw $e;
        }
        // Attach with idempotent check.
        if (! $room->members()->where('users.id', $ownerId)->exists()) {
            $room->members()->attach($ownerId);
        }

        $room->members()->attach($ownerId);

        $this->activityLogger->log(
            "House member created room: {$room->name}",
            Room::class,
            (string) $room->id,
            ['room_name' => $room->name, 'house_member_id' => $houseMemberId]
        );

        return redirect()->route('house.rooms.show', $room);
    }

    public function storeStory(Request $request, Room $room): RedirectResponse
    {
        $ownerId = session('house_owner_id');
        $owner = User::findOrFail($ownerId);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo,document'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'recording' => ['nullable', 'file'],
            'duration' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('stories/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $story = $this->storyService->createStory($owner, $room, $validated);

        if ($owner) {
            $this->activityLogger->log(
                "House member created story: {$story->title}",
                Story::class,
                (string) $story->id,
                ['room_id' => $room->id, 'room_name' => $room->name, 'house_member_id' => session('house_member_id')]
            );
        }

        return redirect()->back()->with('success', 'Memory preserved successfully.');
    }

    public function updateRoom(Request $request, Room $room): RedirectResponse
    {
        $houseMemberId = session('house_member_id');

        abort_unless($room->created_by_house_member_id === $houseMemberId, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'privacy' => ['required', 'string', 'in:public,private'],
        ]);

        $room->update($validated);

        return back()->with('success', 'Room updated successfully.');
    }

    public function settings(): Response
    {
        $member = HouseMember::with('owner')->findOrFail(session('house_member_id'));

        return Inertia::render('house/settings', [
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'avatar' => $member->avatar,
                'bio' => $member->bio,
                'position' => $member->position,
                'preferences' => $member->preferences ?? [],
                'created_at' => $member->created_at->format('M d, Y'),
                'access_url' => route('house.access', $member->access_token),
                'owner_name' => $member->owner?->name,
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $member = HouseMember::findOrFail(session('house_member_id'));

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($request->hasFile('avatar')) {
            $request->validate(['avatar' => ['image', 'max:5120']]);

            if ($member->avatar) {
                $oldPath = str_replace(Storage::url(''), '', $member->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('house-members/avatars', 'public');
            $validated['avatar'] = Storage::url($path);
        }

        $member->update($validated);

        session(['house_member_name' => $member->name]);

        return back()->with('success', 'Profile updated.');
    }

    public function updatePreferences(Request $request): RedirectResponse
    {
        $member = HouseMember::findOrFail(session('house_member_id'));

        $validated = $request->validate([
            'default_privacy' => ['nullable', 'string', 'in:public,private'],
            'email_notifications' => ['nullable', 'boolean'],
        ]);

        $preferences = array_merge($member->preferences ?? [], $validated);
        $member->update(['preferences' => $preferences]);

        return back()->with('success', 'Preferences saved.');
    }

    public function leaveHouse(): RedirectResponse
    {
        $member = HouseMember::findOrFail(session('house_member_id'));

        $member->delete();

        session()->forget(['house_member_id', 'house_member_name', 'house_owner_id']);

        return redirect()->route('home')->with('success', 'You have left the house.');
    }

    public function destroyRoom(Room $room): RedirectResponse
    {
        $houseMemberId = session('house_member_id');

        abort_unless($room->created_by_house_member_id === $houseMemberId, 403);

        $room->delete();

        return redirect()->route('house.dashboard')->with('success', 'Room deleted.');
    }

    protected function authorizeHouseAccess(Room $room, int $ownerId): void
    {
        $allMemberIds = HouseMember::where('owner_id', $ownerId)
            ->pluck('id')
            ->push(HouseMember::where('owner_id', $ownerId)->pluck('id'))
            ->flatten()
            ->unique()
            ->values()
            ->toArray();

        $accessible = $room->created_by === $ownerId
            || in_array($room->created_by_house_member_id, $allMemberIds);

        abort_unless($accessible, 403);
    }
}
