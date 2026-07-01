<?php

namespace App\Http\Controllers;

use App\Mail\MagicLinkMail;
use App\Models\Event;
use App\Models\Room;
use App\Models\RoomGuestSubscription;
use App\Models\Story;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ShareController extends Controller
{
    public function __construct(protected ActivityLogger $activityLogger)
    {
    }

    public function showRoom(string $slug): InertiaResponse
    {
        $room = Room::where('slug', $slug)->firstOrFail();

        if ($room->enable_tributes) {
            return $this->showRoomTributes($room);
        }

        return $this->showRoomShare($room);
    }

    private function showRoomTributes(Room $room): InertiaResponse
    {
        $room->load(['approvedTributes']);
        $candles = $room->candles()->where('is_approved', true)->get();

        $thumbnail = $room->thumbnail
            ?? optional($room->approvedTributes->first())->image_url;

        return Inertia::render('share/room-tribute', [
            'room' => $room,
            'tributes' => $room->approvedTributes,
            'candles' => $candles,
            'title' => $room->name.' - Uloak, House of Stories',
            'meta_description' => $room->description
                ? Str::limit($room->description, 155)
                : 'View and share memories, stories, and tributes in this room.',
            'meta_image' => $thumbnail ?? url('/images/og-image.webp'),
            'meta_url' => url()->route('share.rooms.show', $room->slug),
        ]);
    }

    private function showRoomShare(Room $room): InertiaResponse
    {
        $stories = $room->stories()
            ->whereNull('follow_up_to')
            ->with(['comments' => function ($q) {
                $q->latest();
            }, 'followUpStories'])
            ->latest()
            ->get()
            ->map(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'type' => $story->type,
                'description' => $story->description,
                'author' => $story->user?->name ?? $story->getGuestName() ?? 'Anonymous',
                'email' => $story->guest_email,
                'thumbnail' => $story->thumbnail,
                'file_url' => $story->file_url,
                'assets' => $story->assets ?? [],
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
                    'author' => $fs->user?->name ?? $fs->getGuestName() ?? 'Anonymous',
                    'created_at' => $fs->created_at->format('M d, Y'),
                ]),
                'date' => $story->created_at->format('M d, Y'),
                'tags' => $story->tags ?? [],
            ]);

        $thumbnail = $room->thumbnail;

        return Inertia::render('share/room-share', [
            'room' => [
                'id' => $room->id,
                'slug' => $room->slug,
                'name' => $room->name,
                'media_items' => $room->media_items ?? [],
                'description' => $room->description,
                'thumbnail' => $room->thumbnail,
                'room_type' => $room->room_type,
                'tribute_song' => $room->tribute_song,
            ],
            'stories' => $stories,
            'title' => $room->name.' - Uloak, House of Stories',
            'meta_description' => $room->description
                ? Str::limit($room->description, 155)
                : 'Share your memories, photos, videos in this room.',
            'meta_image' => $thumbnail ?? url('/images/og-image.webp'),
            'meta_url' => url()->route('share.rooms.show', $room->slug),
            'flash' => session('success') ? ['success' => session('success')] : null,
        ]);
    }

    public function showEvent(string $slug): InertiaResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $event->loadCount('stories');

        $stories = $event->stories()->with('user')->latest()->get()->map(fn ($story) => [
            'id' => $story->id,
            'title' => $story->title,
            'thumbnail' => $story->thumbnail,
            'type' => $story->type,
            'description' => $story->description,
            'author' => $story->user?->name ?? $story->getGuestName() ?? 'Anonymous',
            'tags' => $story->tags ?? [],
            'date' => $story->created_at->format('M d, Y'),
            'file_url' => $story->file_url,
            'assets' => $story->assets ?? [],
        ]);

        return Inertia::render('share/event', [
            'event' => $event,
            'stories' => $stories,
            'title' => $event->name.' - Uloak, House of Stories',
            'meta_description' => $event->description
                ? Str::limit($event->description, 155)
                : 'View and share memories in this event.',
            'meta_image' => $event->thumbnail ?? url('/images/og-image.webp'),
            'meta_url' => url()->route('share.events.show', $event->slug),
        ]);
    }

    /**
     * Store a guest contribution (story) on a room.
     */
    public function storeRoomContribution(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
            'recording' => ['nullable', 'file', 'max:51200'],
        ]);

        $fileUrl = null;
        $assets = [];

        // Handle recording (camera capture or audio recording blob)
        if ($request->hasFile('recording')) {
            $recording = $request->file('recording');
            $path = $recording->store('stories/rooms/'.$room->id.'/guest-media', 'public');
            $fileUrl = Storage::url($path);
            // Trust the client-sent type — the frontend knows whether the user
            // clicked "Record Audio" or "Record Video". .webm files report as
            // video/webm even for audio-only recordings, so MIME is unreliable here.
            $type = $validated['type'];
            $validated['type'] = $type;
            $assets[] = [
                'url' => $fileUrl,
                'type' => $type,
                'title' => $recording->getClientOriginalName(),
            ];
        }

        // Handle uploaded files
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('stories/rooms/'.$room->id.'/guest-assets', 'public');
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
                    // Override the story-level type based on the first file's actual MIME type
                    $validated['type'] = $type;
                }
            }
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('stories/rooms/'.$room->id.'/guest-thumbnails', 'public');
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
            'user_id' => null,
            'guest_name' => $validated['guest_name'],
            'guest_email' => $validated['guest_email'],
            'title' => $validated['title'] ?? ($validated['type'] === 'video' ? 'Video Recording' : ($validated['type'] === 'audio' ? 'Audio Recording' : 'Photo')),
            'type' => $validated['type'],
            'description' => $validated['description'] ?? '',
            'file_url' => $fileUrl,
            'thumbnail' => $thumbnail,
            'assets' => $assets,
            'tags' => ['guest-contribution'],
        ]);

        return redirect()->back()->with('success', 'Your memory has been shared!');
    }

    /**
     * Store a follow-up media on an existing story.
     */
    public function storeRoomFollowUpMedia(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'story_id' => ['required', 'exists:stories,id'],
            'type' => ['required', 'string', 'in:video,audio,photo'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'recording' => ['nullable', 'file', 'max:51200'],
        ]);

        $fileUrl = null;
        $assets = [];

        if ($request->hasFile('recording')) {
            $recording = $request->file('recording');
            $path = $recording->store('stories/rooms/'.$room->id.'/guest-media', 'public');
            $fileUrl = Storage::url($path);
            // Trust the client-sent type — .webm files report as video/webm even for audio-only
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
                $path = $file->store('stories/rooms/'.$room->id.'/guest-assets', 'public');
                $url = Storage::url($path);
                $mime = $file->getMimeType();
                $type = str_contains($mime, 'video') ? 'video' : (str_contains($mime, 'audio') ? 'audio' : 'photo');
                $assets[] = [
                    'url' => $url,
                    'type' => $type,
                    'title' => $file->getClientOriginalName(),
                ];
                if (! $fileUrl) {
                    $fileUrl = $url;
                }
            }
        }

        Story::create([
            'room_id' => $room->id,
            'user_id' => null,
            'guest_name' => $validated['guest_name'],
            'guest_email' => $validated['guest_email'],
            'title' => 'Follow-up media',
            'type' => $validated['type'],
            'description' => '',
            'file_url' => $fileUrl,
            'thumbnail' => $validated['type'] === 'photo' ? $fileUrl : null,
            'assets' => $assets,
            'tags' => ['guest-contribution', 'follow-up'],
            'follow_up_to' => $validated['story_id'],
        ]);

        return redirect()->back()->with('success', 'Follow-up media added!');
    }

    /**
     * Store a guest's name and email subscription for upload reminders.
     */
    public function storeGuestSubscription(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);
        $exists = RoomGuestSubscription::where('room_id', $room->id)->where('email', $validated['email'])->exists();
        if($exists){
            return redirect()->back()->with('success', 'You\'ve been registered!');
        }

        $room->guestSubscriptions()->updateOrCreate(
            ['email' => $validated['email']],
            ['name' => $validated['name']],
        );

        return redirect()->back()->with('success', 'You\'ve been registered!');
    }

    /**
     * Store a guest comment on a room's story.
     */
    public function storeRoomComment(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'story_id' => ['required', 'exists:stories,id'],
            'content' => ['required', 'string', 'max:1000'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
        ]);

        $story = Story::where('room_id', $room->id)->findOrFail($validated['story_id']);

        $story->comments()->create([
            'user_id' => null,
            'guest_name' => $validated['guest_name'],
            'guest_email' => $validated['guest_email'] ?? null,
            'content' => $validated['content'],
        ]);

        return redirect()->back()->with('success', 'Comment added!');
    }

    /**
     * Store a guest contribution (story) on an event.
     */
    public function storeEventContribution(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo,document'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
        ]);

        $fileUrl = null;
        $assets = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('stories/events/'.$event->id.'/guest-assets', 'public');
                $url = Storage::url($path);

                $mime = $file->getMimeType();
                $type = 'photo';
                if ($mime === 'application/pdf') {
                    $type = 'pdf';
                } elseif (str_contains($mime, 'video')) {
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
                }
            }
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('stories/events/'.$event->id.'/guest-thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $thumbnail = null;
        if (isset($validated['thumbnail'])) {
            $thumbnail = $validated['thumbnail'];
        } elseif (in_array($validated['type'], ['photo', 'document'])) {
            $thumbnail = $fileUrl;
        }

        Story::create([
            'event_id' => $event->id,
            'user_id' => null,
            'guest_name' => $validated['guest_name'],
            'guest_email' => $validated['guest_email'],
            'title' => $validated['title'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? '',
            'file_url' => $fileUrl,
            'thumbnail' => $thumbnail,
            'assets' => $assets,
            'tags' => ['guest-contribution'],
        ]);

        return redirect()->back()->with('success', 'Your memory has been shared. It will appear after review.');
    }

    public function sendMagicLink(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'type' => ['required', 'string', 'in:room,event'],
            'slug' => ['required', 'string'],
        ]);

        $space = $validated['type'] === 'room'
            ? Room::where('slug', $validated['slug'])->firstOrFail()
            : Event::where('slug', $validated['slug'])->firstOrFail();

        $user = User::firstOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'password' => Hash::make(Str::random(32)),
            ]
        );

        $redirectUrl = $validated['type'] === 'room'
            ? route('dashboard.rooms.show', $space->slug)
            : route('dashboard.events.show', $space->slug);

        $magicUrl = URL::temporarySignedRoute(
            'magic.login',
            now()->addMinutes(30),
            [
                'email' => $user->email,
                'redirect' => $redirectUrl,
            ]
        );

        Mail::to($user->email)->send(new MagicLinkMail($user->name, $magicUrl, $space->name));

        if ($request->user()) {
            $this->activityLogger->log(
                "Sent magic link to: {$user->email}",
                User::class,
                (string) $user->id,
                ['email' => $user->email, 'space_type' => $validated['type'], 'space_slug' => $validated['slug']]
            );
        }

        return back()->with('success', 'A secure magic link has been sent to your email. Check your inbox to enter.');
    }

    /**
     * Delete a guest story from a room.
     */
    public function destroyStory(Request $request, Room $room, Story $story): RedirectResponse|JsonResponse
    {
        if ($story->room_id !== $room->id) {
            abort(404);
        }

        $story->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Memory deleted.');
    }

    public function magicLogin(Request $request): RedirectResponse
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Invalid or expired magic link.');
        }

        $user = User::where('email', $request->email)->firstOrFail();

        Auth::login($user, true);

        $this->activityLogger->log(
            "Guest login via magic link: {$user->email}",
            User::class,
            (string) $user->id,
            ['email' => $user->email, 'login_method' => 'magic_link']
        );

        $redirect = $request->input('redirect', route('dashboard'));

        return redirect($redirect);
    }
}
