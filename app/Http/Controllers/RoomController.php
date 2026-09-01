<?php

namespace App\Http\Controllers;

use App\Media\MediaManager;
use App\Models\Client;
use App\Models\Media;
use App\Models\Room;
use App\Models\RoomMember;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\RoomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use ZipArchive;

class RoomController extends Controller
{
    public function __construct(
        protected RoomService $roomService,
        protected ActivityLogger $activityLogger,
        protected MediaManager $mediaManager,
    ) {}

    public function show(Room $room): Response
    {
        $room = $this->roomService->getRoomDetails($room);
        $room->loadCount('stories');
        $pendingTributes = $room->tributes()->where('is_approved', false)->latest()->get();
        $approvedTributes = $room->tributes()->where('is_approved', true)->latest()->get();
        $allTributes = $room->tributes;
        $candles = $room->candles()->orderByRaw('CASE WHEN is_approved = false THEN 0 ELSE 1 END')->get();

        $storiesPaginator = $room->stories()->latest()->cursorPaginate(24)->through(fn ($story) => [
            'uuid' => $story->uuid,
            'id' => $story->id,
            'title' => $story->title,
            'thumbnail' => $story->thumbnail ? Storage::disk('public')->url($story->thumbnail) : null,
            'type' => $story->type,
            'description' => $story->description,
            'author' => $story->user?->name ?? $story->guest_name,
            'tags' => $story->tags ?? [],
            'date' => $story->created_at->format('M d, Y'),
            'file_url' => $story->file_url ? Storage::disk('public')->url($story->file_url) : null,
            'assets' => $story->assets ?? [],
        ]);

        $pageTitle = $room->name.' - Ulo of Stories';
        $pageDescription = $room->description
            ? Str::limit($room->description, 155)
            : 'Browse memories, stories, and tributes in this room on Ulo of Stories.';

        return Inertia::render('dashboard/rooms/show', [
            'title' => $pageTitle,
            'meta_description' => $pageDescription,
            'meta_image' => $room->thumbnail ?? url('/images/og-image.webp'),
            'room' => [
                ...$room->toArray(),
                'room_type' => $room->room_type ?? null,
                'tributes_count' => $room->tributes()->count(),
            ],
            'pendingTributes' => $pendingTributes,
            'approvedTributes' => $approvedTributes,
            'allTributes' => $allTributes,
            'stories' => $storiesPaginator->items(),
            'pagination' => [
                'next_cursor' => $storiesPaginator->nextCursor()?->encode(),
                'path' => $storiesPaginator->path(),
                'per_page' => $storiesPaginator->perPage(),
            ],
            'candles' => $candles,
        ]);
    }

    public function feed(Room $room): Response
    {
        $stories = Story::where('room_id', $room->id)
            ->where('type', 'video')
            ->with('user')
            ->withCount('likes')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        $user = auth()->user();
        $guestEmail = request()->cookie('ulo of stories_guest_email');
        $guestIdentifier = $guestEmail ? hash('sha256', strtolower($guestEmail)) : null;

        return Inertia::render('dashboard/rooms/feed', [
            'title' => $room->name.' - Reels - Ulo of Stories',
            'meta_description' => 'Browse video memories in '.$room->name,
            'room' => [
                'id' => $room->id,
                'slug' => $room->slug,
                'name' => $room->name,
            ],
            'initialVideos' => $stories->map(fn (Story $story) => [
                'id' => $story->id,
                'uuid' => $story->uuid,
                'title' => $story->title,
                'description' => $story->description,
                'type' => $story->type,
                'file_url' => $story->file_url ? Storage::disk('public')->url($story->file_url) : null,
                'thumbnail' => $story->thumbnail ? Storage::disk('public')->url($story->thumbnail) : null,
                'duration' => $story->duration,
                'author' => $story->user?->name ?? $story->guest_name,
                'date' => $story->created_at->format('M d, Y'),
                'tags' => $story->tags ?? [],
                'comments_count' => $story->comments()->count(),
                'likes_count' => $story->likes_count,
                'is_liked' => $user
                    ? $story->likes()->where('user_id', $user->id)->exists()
                    : ($guestIdentifier ? $story->likes()->where('guest_identifier', $guestIdentifier)->exists() : false),
                'user' => $story->relationLoaded('user') && $story->user ? [
                    'id' => $story->user->id,
                    'name' => $story->user->name,
                    'avatar' => $story->user->profile_photo_url,
                ] : null,
            ])->values()->all(),
            'nextCursor' => $stories->last()?->id,
            'hasMore' => $stories->count() === 10,
        ]);
    }

    public function update(Request $request, Room $room): RedirectResponse
    {
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
        ]);

        if ($request->hasFile('thumbnail')) {
            $media = $this->mediaManager->uploadImage($request->file('thumbnail'));
            $validated['thumbnail'] = $media->url();
        }

        if ($request->hasFile('tribute_song')) {
            $media = $this->mediaManager->uploadAudio($request->file('tribute_song'));
            $validated['tribute_song'] = $media->url();
        }

        // Merge existing media URLs with newly uploaded files
        $existingMediaUrls = $request->input('existing_media_urls');
        $existingMedia = [];
        if ($existingMediaUrls) {
            $decoded = json_decode($existingMediaUrls, true);
            if (is_array($decoded)) {
                foreach ($decoded as $url) {
                    $existingMedia[] = [
                        'url' => $url,
                        'type' => str_contains($url, '.mp4') || str_contains($url, '.mov') || str_contains($url, '.webm') ? 'video' : 'image',
                    ];
                }
            }
        }

        $newMedia = [];
        if ($request->hasFile('media_files')) {
            foreach ($request->file('media_files') as $file) {
                $media = $this->uploadViaPipeline($file);
                $newMedia[] = [
                    'url' => $media->url(),
                    'type' => str_starts_with($media->mime_type, 'video') ? 'video' : 'image',
                ];
            }
        }

        $validated['media_items'] = array_merge($existingMedia, $newMedia);

        $room->update($validated);

        $this->activityLogger->log(
            "Updated room: {$room->name}",
            Room::class,
            (string) $room->id,
            ['room_name' => $room->name]
        );

        return back()->with('success', 'Room updated successfully.');
    }

    public function store(Request $request): RedirectResponse
    {
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
            $media = $this->mediaManager->uploadImage($request->file('thumbnail'));
            $validated['thumbnail'] = $media->url();
        }

        if ($request->hasFile('tribute_song')) {
            $media = $this->mediaManager->uploadAudio($request->file('tribute_song'));
            $validated['tribute_song'] = $media->url();
        }

        if ($request->hasFile('media_items')) {
            $mediaItems = [];
            foreach ($request->file('media_items') as $file) {
                $media = $this->uploadViaPipeline($file);
                $mediaItems[] = [
                    'url' => $media->url(),
                    'type' => str_starts_with($media->mime_type, 'video') ? 'video' : 'image',
                ];
            }
            $validated['media_items'] = $mediaItems;
        }

        // Paywall: only "general" stays free (Starter). Every other occasion type is a paid Full Room.
        // Wedding has its own dedicated funnel; the rest go to /pricing. Redirect instead of 422 so
        // the user actually lands on the paywall instead of seeing a dashboard validation error.
        $paywalledTypes = ['wedding', 'birthday', 'burial', 'memorial', 'anniversary', 'graduation'];
        $requestedType = $validated['room_type'] ?? 'general';
        $requestedTier = $validated['tier_type'] ?? null;

        if (in_array($requestedType, $paywalledTypes, true) || $requestedTier === 'full_room' || $requestedTier === 'family_archive') {
            return redirect()->route('weddings.create', ['type' => $requestedType !== 'general' ? $requestedType : 'wedding'])->with('info', 'This occasion requires a paid Full Room — pick the type on the next page and checkout at the same price.');
        }

        $room = $this->roomService->createRoom($request->user(), $validated);

        // Attach client if specified (business admin)
        if ($request->filled('client_id')) {
            $client = Client::find($request->input('client_id'));
            if ($client && $client->business_user_id === $request->user()->id) {
                $room->clients()->syncWithoutDetaching([$client->id]);
            }
        }

        $this->activityLogger->log(
            "Created room: {$room->name}",
            Room::class,
            (string) $room->id,
            ['room_name' => $room->name]
        );

        return redirect()->route('dashboard.rooms.show', $room);
    }

    /**
     * Download all media (images, videos, audio) from all tributes and stories in a room as a ZIP file.
     */
    public function downloadMedia(Room $room)
    {
        $files = [];
        $tributes = $room->tributes;
        $stories = $room->stories;

        // Collect from tributes
        foreach ($tributes as $tribute) {
            $prefix = Str::slug($tribute->name, '_').'_';

            // Collect images
            if (! empty($tribute->images)) {
                foreach ($tribute->images as $image) {
                    $relativePath = preg_replace('#^storage/#', '', ltrim($image, '/'));
                    $absolutePath = Storage::disk('public')->path($relativePath);
                    if (file_exists($absolutePath)) {
                        $files[] = [
                            'path' => $absolutePath,
                            'name' => $prefix.'image_'.basename($relativePath),
                        ];
                    }
                }
            }

            // Collect video
            if (! empty($tribute->video)) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($tribute->video, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = [
                        'path' => $absolutePath,
                        'name' => $prefix.'video_'.basename($relativePath),
                    ];
                }
            }

            // Collect audio
            if (! empty($tribute->audio)) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($tribute->audio, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = [
                        'path' => $absolutePath,
                        'name' => $prefix.'audio_'.basename($relativePath),
                    ];
                }
            }
        }

        // Collect from stories
        foreach ($stories as $story) {
            $storyPrefix = 'story_'.$story->id.'_';

            // Collect file_url (main media file)
            if (! empty($story->file_url)) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($story->file_url, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = [
                        'path' => $absolutePath,
                        'name' => $storyPrefix.'main_'.basename($relativePath),
                    ];
                }
            }

            // Collect assets (additional uploaded files)
            if (! empty($story->assets)) {
                foreach ($story->assets as $index => $asset) {
                    $assetUrl = $asset['url'] ?? null;
                    if ($assetUrl) {
                        $relativePath = preg_replace('#^storage/#', '', ltrim($assetUrl, '/'));
                        $absolutePath = Storage::disk('public')->path($relativePath);
                        if (file_exists($absolutePath)) {
                            $files[] = [
                                'path' => $absolutePath,
                                'name' => $storyPrefix.'asset_'.($index + 1).'_'.basename($relativePath),
                            ];
                        }
                    }
                }
            }

            // Collect thumbnail if different from file_url
            if (! empty($story->thumbnail) && $story->thumbnail !== $story->file_url) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($story->thumbnail, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = [
                        'path' => $absolutePath,
                        'name' => $storyPrefix.'thumbnail_'.basename($relativePath),
                    ];
                }
            }
        }

        if (empty($files)) {
            logger('No media files found in any tributes or stories for this room.');

            return back()->with('error', 'No media files found in this room.');
        }

        $sanitizedName = Str::slug($room->name, '_');
        $zipFilename = "{$sanitizedName}_media.zip";
        $zipPath = storage_path("app/{$zipFilename}");

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            logger('Could not create ZIP file.');

            return back()->with('error', 'Could not create ZIP file.');
        }

        foreach ($files as $file) {
            $zip->addFile($file['path'], $file['name']);
        }
        $zip->close();

        return response()->download($zipPath, $zipFilename, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    protected function uploadViaPipeline(UploadedFile $file): Media
    {
        $mime = $file->getMimeType() ?: $file->getClientMimeType();

        if (str_starts_with($mime, 'video/')) {
            return $this->mediaManager->uploadVideo($file);
        }

        return $this->mediaManager->uploadImage($file);
    }

    // ── Family Member Management ──

    /**
     * List family members for a room.
     */
    public function members(Room $room): JsonResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);

        $members = $room->familyMembers()->latest()->get()->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'relationship' => $m->relationship,
            'access_url' => route('family.access', $m->access_token),
            'created_at' => $m->created_at->format('M d, Y'),
        ]);

        return response()->json(['members' => $members]);
    }

    /**
     * Add a family member to a room.
     */
    public function storeMember(Request $request, Room $room): RedirectResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:255'],
        ]);

        $member = $room->familyMembers()->create($validated);

        $this->activityLogger->log(
            "Added family member to room: {$room->name}",
            RoomMember::class,
            (string) $member->id,
            ['room_id' => $room->id, 'room_name' => $room->name, 'member_name' => $member->name]
        );

        $accessUrl = route('family.access', $member->access_token);

        return back()->with('success', 'Family member added! Share this link with them: '.$accessUrl);
    }

    /**
     * Remove a family member from a room.
     */
    public function destroyMember(Room $room, RoomMember $member): RedirectResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);

        if ($member->room_id !== $room->id) {
            abort(404);
        }

        $memberName = $member->name;
        $memberId = $member->getKey();

        $member->delete();

        $this->activityLogger->log(
            "Removed family member from room: {$room->name}",
            RoomMember::class,
            (string) $memberId,
            ['room_id' => $room->id, 'room_name' => $room->name, 'member_name' => $memberName]
        );

        return back()->with('success', 'Family member removed.');
    }

    /**
     * Regenerate a family member's access token.
     */
    public function regenerateMemberToken(Room $room, RoomMember $member): RedirectResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);

        if ($member->room_id !== $room->id) {
            abort(404);
        }

        $member->regenerateToken();

        $this->activityLogger->log(
            "Regenerated access token for member: {$member->name} in room: {$room->name}",
            RoomMember::class,
            (string) $member->getKey(),
            ['room_id' => $room->id, 'room_name' => $room->name, 'member_name' => $member->name]
        );

        $accessUrl = route('family.access', $member->access_token);

        return back()->with('success', 'New access link generated: '.$accessUrl);
    }
}
