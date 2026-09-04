<?php

namespace App\Http\Controllers;

use App\Mail\MagicLinkMail;
use App\Media\MediaManager;
use App\Models\Event;
use App\Models\GuestIdentity;
use App\Models\Media;
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
use ZipArchive;

class ShareController extends Controller
{
    public function __construct(protected ActivityLogger $activityLogger, protected MediaManager $mediaManager) {}

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
            'title' => $room->name.' - Ulo of Stories',
            'meta_description' => $room->description
                ? Str::limit($room->description, 155)
                : 'View and share memories, stories, and tributes in this room.',
            'meta_image' => $thumbnail ?? url('/images/og-image.webp'),
            'meta_url' => url()->route('share.rooms.show', $room->slug),
        ]);
    }

    private function showRoomShare(Room $room): InertiaResponse
    {
        $paginator = $room->stories()
            ->whereNull('follow_up_to')
            ->with(['comments' => function ($q) {
                $q->latest();
            }, 'followUpStories'])
            ->latest()
            ->cursorPaginate(24);

        $stories = $paginator->through(function ($story) {
            $assets = $story->assets ?? [];
            $isProcessing = false;
            $enrichedAssets = $assets;

            // Enrich assets with live media status so frontend can show placeholder (pending → processing → ready)
            if (! empty($assets)) {
                $uuids = collect($assets)->pluck('media_uuid')->filter()->values()->all();
                if (! empty($uuids)) {
                    $mediaMap = Media::whereIn('uuid', $uuids)->get()->keyBy('uuid');
                    $enrichedAssets = collect($assets)->map(function ($asset) use ($mediaMap, &$isProcessing) {
                        $uuid = $asset['media_uuid'] ?? null;
                        if ($uuid && isset($mediaMap[$uuid])) {
                            $media = $mediaMap[$uuid];
                            $asset['status'] = $media->status;
                            $asset['progress'] = $media->progress;
                            if (in_array($media->status, ['uploading', 'processing'], true)) {
                                $isProcessing = true;
                            }
                        } elseif (($asset['type'] ?? null) === 'video' && empty($asset['url'])) {
                            $isProcessing = true;
                        }

                        return $asset;
                    })->all();
                    // Fallback: if any asset type video but story type video and no ready media, treat as processing
                    if (! $isProcessing && $story->type === 'video') {
                        $hasReadyVideo = collect($enrichedAssets)->contains(fn ($a) => ($a['type'] ?? '') === 'video' && ($a['status'] ?? 'ready') === 'ready');
                        $hasVideoAsset = collect($enrichedAssets)->contains(fn ($a) => ($a['type'] ?? '') === 'video');
                        if ($hasVideoAsset && ! $hasReadyVideo) {
                            $isProcessing = true;
                        }
                    }
                }
            } elseif ($story->type === 'video' && empty($story->file_url)) {
                $isProcessing = true;
            }

            return [
                'id' => $story->id,
                'title' => $story->title,
                'type' => $story->type,
                'description' => $story->description,
                'author' => $story->user?->name ?? $story->getGuestName() ?? 'Anonymous',
                'email' => $story->guest_email,
                'thumbnail' => $story->thumbnail,
                'file_url' => $story->file_url,
                'assets' => $enrichedAssets,
                'is_processing' => $isProcessing,
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
            ];
        });

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
            'stories' => $stories->items(),
            'pagination' => [
                'next_cursor' => $paginator->nextCursor()?->encode(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
            ],
            'title' => $room->name.' - Ulo of Stories',
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

        $paginator = $event->stories()->with('user')->latest()->cursorPaginate(24);

        $stories = $paginator->through(fn ($story) => [
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
            'stories' => $stories->items(),
            'pagination' => [
                'next_cursor' => $paginator->nextCursor()?->encode(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
            ],
            'title' => $event->name.' - Ulo of Stories',
            'meta_description' => $event->description
                ? Str::limit($event->description, 155)
                : 'View and share memories in this event.',
            'meta_image' => $event->thumbnail ?? url('/images/og-image.webp'),
            'meta_url' => url()->route('share.events.show', $event->slug),
        ]);
    }

    /**
     * Store a guest contribution (story) on a room — Option B parity with annex-memory-modal.
     * Accepts pre-uploaded media_uuids from the guest pipeline (watermarked + async transcoded).
     * Fallback legacy files/recording are now also routed through MediaManager so the bypass is removed.
     */
    public function storeRoomContribution(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo'],
            'media_uuids' => ['nullable', 'array'],
            'media_uuids.*' => ['uuid', 'exists:media,uuid'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'recording' => ['nullable', 'file', 'max:51200'],
            'duration' => ['nullable', 'string', 'max:20'],
        ]);

        $guest = $this->resolveGuestIdentity($request, $room, null, $validated['guest_name'], $validated['guest_email'] ?? null);

        $fileUrl = null;
        $thumbnail = $validated['thumbnail'] ?? null;
        $assets = [];
        $mediaUuids = $validated['media_uuids'] ?? [];

        // 1) Preferred path: media_uuids from guest pipeline (2-phase, watermarked)
        if (! empty($mediaUuids)) {
            $medias = Media::whereIn('uuid', $mediaUuids)->get()->keyBy('uuid');

            foreach ($mediaUuids as $uuid) {
                $media = $medias->get($uuid);
                if (! $media) {
                    continue;
                }

                // Link guest for provenance (if media was uploaded anonymously before)
                if (! $media->guest_identity_id) {
                    $media->update(['guest_identity_id' => $guest->id]);
                }

                $type = $this->inferMediaType($media);
                $assets[] = [
                    'media_uuid' => $media->uuid,
                    'url' => $media->url(),
                    'type' => $type,
                    'title' => $media->original_name,
                ];

                if (! $fileUrl) {
                    $fileUrl = $media->url();
                    $validated['type'] = $type;
                    $thumbnail = $media->thumbnail ? (str_starts_with($media->thumbnail, 'http') ? $media->thumbnail : Storage::disk($media->disk)->url($media->thumbnail)) : $media->thumbnail();
                }
            }
        }

        // 2) Legacy fallback: files/recording — now also via Media pipeline (no raw Storage bypass)
        if (empty($assets)) {
            if ($request->hasFile('recording')) {
                $recording = $request->file('recording');
                $mime = $recording->getMimeType() ?: $recording->getClientMimeType();
                $isVideo = $validated['type'] === 'video' || str_starts_with((string) $mime, 'video/');
                try {
                    $media = $isVideo ? $this->mediaManager->uploadVideo($recording) : $this->mediaManager->uploadImage($recording);
                    $media->update(['guest_identity_id' => $guest->id]);
                    $type = $validated['type'];
                    $fileUrl = $media->url();
                    $thumbnail = $media->thumbnail ? Storage::disk($media->disk)->url($media->thumbnail) : null;
                    $assets[] = ['media_uuid' => $media->uuid, 'url' => $fileUrl, 'type' => $type, 'title' => $recording->getClientOriginalName()];
                } catch (\Throwable $e) {
                    return redirect()->back()->withErrors(['recording' => $e->getMessage()]);
                }
            }

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $mime = $file->getMimeType() ?: $file->getClientMimeType();
                    $ext = strtolower($file->getClientOriginalExtension());
                    $isVideo = str_contains((string) $mime, 'video') || in_array($ext, ['mp4', 'mov', 'avi', 'mkv', 'webm'], true);
                    $isAudio = str_contains((string) $mime, 'audio') || in_array($ext, ['mp3', 'wav', 'm4a', 'ogg', 'webm'], true);
                    try {
                        $media = $isVideo ? $this->mediaManager->uploadVideo($file) : $this->mediaManager->uploadImage($file);
                        $media->update(['guest_identity_id' => $guest->id]);
                        $type = $isVideo ? 'video' : ($isAudio ? 'audio' : 'photo');
                        $url = $media->url();
                        $assets[] = ['media_uuid' => $media->uuid, 'url' => $url, 'type' => $type, 'title' => $file->getClientOriginalName()];
                        if (! $fileUrl) {
                            $fileUrl = $url;
                            $validated['type'] = $type;
                            $thumbnail = $media->thumbnail ? Storage::disk($media->disk)->url($media->thumbnail) : ($type === 'photo' ? $url : null);
                        }
                    } catch (\Throwable $e) {
                        continue;
                    }
                }
            }

            if ($request->hasFile('thumbnail') && ! $thumbnail) {
                $path = $request->file('thumbnail')->store('stories/rooms/'.$room->id.'/guest-thumbnails', 'public');
                $thumbnail = Storage::url($path);
            }
        } else {
            // media_uuids path — still handle thumbnail upload if guest supplied one
            if ($request->hasFile('thumbnail') && ! $thumbnail) {
                $path = $request->file('thumbnail')->store('stories/rooms/'.$room->id.'/guest-thumbnails', 'public');
                $thumbnail = Storage::url($path);
            }
        }

        if (! $fileUrl && empty($assets)) {
            return redirect()->back()->withErrors(['files' => 'Please upload a photo, video or audio file.']);
        }

        if (empty($thumbnail) && $validated['type'] === 'photo' && $fileUrl) {
            $thumbnail = $fileUrl;
        }

        $story = Story::create([
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

        if (! empty($validated['duration'])) {
            $story->update(['duration' => $validated['duration']]);
        }

        return redirect()->back()->with('success', 'Your memory has been shared!');
    }

    protected function resolveGuestIdentity(Request $request, ?Room $room, ?Event $event, string $name, ?string $email): GuestIdentity
    {
        $ip = $request->ip();

        // Prefer existing unexpired identity for this room/event + email/ip to avoid churn
        $query = GuestIdentity::query()->where('name', $name)->where('ip_address', $ip)->where('expires_at', '>', now());

        if ($room) {
            $query->where('room_id', $room->id);
        }

        if ($event) {
            $query->where('event_id', $event->id);
        }

        if ($email) {
            $query->orWhere(function ($q) use ($email, $room, $event) {
                $q->where('email', $email);
                if ($room) {
                    $q->where('room_id', $room->id);
                }
                if ($event) {
                    $q->where('event_id', $event->id);
                }
            });
        }

        $existing = $query->latest()->first();

        if ($existing && ! $existing->isExpired()) {
            $existing->update(['name' => $name, 'email' => $email ?? $existing->email]);

            return $existing;
        }

        return GuestIdentity::create([
            'room_id' => $room?->id,
            'event_id' => $event?->id,
            'name' => $name,
            'email' => $email,
            'ip_address' => $ip,
            'expires_at' => now()->addHours(24),
        ]);
    }

    protected function inferMediaType(Media $media): string
    {
        // Explicit type wins — audio/webm; codecs=opus is often sniffed as video/webm by finfo, but must stay audio
        if ($media->type === 'audio') {
            return 'audio';
        }
        if ($media->type === 'video') {
            return 'video';
        }
        $baseMime = strtolower(trim(explode(';', (string) $media->mime_type)[0]));
        if (str_contains($baseMime, 'audio')) {
            return 'audio';
        }
        if (str_starts_with($baseMime, 'video/')) {
            return 'video';
        }

        return 'photo';
    }

    /**
     * Store a follow-up media on an existing story — parity: media_uuids + ephemeral guest + pipeline.
     */
    public function storeRoomFollowUpMedia(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'story_id' => ['required', 'exists:stories,id'],
            'type' => ['required', 'string', 'in:video,audio,photo'],
            'media_uuids' => ['nullable', 'array'],
            'media_uuids.*' => ['uuid', 'exists:media,uuid'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'recording' => ['nullable', 'file', 'max:51200'],
        ]);

        $guest = $this->resolveGuestIdentity($request, $room, null, $validated['guest_name'], $validated['guest_email'] ?? null);

        $fileUrl = null;
        $assets = [];
        $mediaUuids = $validated['media_uuids'] ?? [];

        if (! empty($mediaUuids)) {
            $medias = Media::whereIn('uuid', $mediaUuids)->get()->keyBy('uuid');
            foreach ($mediaUuids as $uuid) {
                $media = $medias->get($uuid);
                if (! $media) {
                    continue;
                }
                if (! $media->guest_identity_id) {
                    $media->update(['guest_identity_id' => $guest->id]);
                }
                $type = $this->inferMediaType($media);
                $url = $media->url();
                $assets[] = ['media_uuid' => $media->uuid, 'url' => $url, 'type' => $type, 'title' => $media->original_name];
                if (! $fileUrl) {
                    $fileUrl = $url;
                }
            }
        }

        if (empty($assets)) {
            if ($request->hasFile('recording')) {
                $recording = $request->file('recording');
                $isVideo = $validated['type'] === 'video';
                try {
                    $media = $isVideo ? $this->mediaManager->uploadVideo($recording) : $this->mediaManager->uploadImage($recording);
                    $media->update(['guest_identity_id' => $guest->id]);
                    $url = $media->url();
                    $assets[] = ['media_uuid' => $media->uuid, 'url' => $url, 'type' => $validated['type'], 'title' => $recording->getClientOriginalName()];
                    $fileUrl = $url;
                } catch (\Throwable $e) {
                    return redirect()->back()->withErrors(['recording' => $e->getMessage()]);
                }
            }

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $mime = $file->getMimeType() ?: $file->getClientMimeType();
                    $isVideo = str_contains((string) $mime, 'video');
                    try {
                        $media = $isVideo ? $this->mediaManager->uploadVideo($file) : $this->mediaManager->uploadImage($file);
                        $media->update(['guest_identity_id' => $guest->id]);
                        $type = $this->inferMediaType($media);
                        $url = $media->url();
                        $assets[] = ['media_uuid' => $media->uuid, 'url' => $url, 'type' => $type, 'title' => $file->getClientOriginalName()];
                        if (! $fileUrl) {
                            $fileUrl = $url;
                        }
                    } catch (\Throwable) {
                        continue;
                    }
                }
            }
        }

        if (! $fileUrl && empty($assets)) {
            return redirect()->back()->withErrors(['files' => 'Please upload a file.']);
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
        if ($exists) {
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
     * Store a guest contribution (story) on an event — parity: media_uuids + ephemeral guest + pipeline, no document.
     */
    public function storeEventContribution(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo'],
            'media_uuids' => ['nullable', 'array'],
            'media_uuids.*' => ['uuid', 'exists:media,uuid'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
        ]);

        $guest = $this->resolveGuestIdentity($request, null, $event, $validated['guest_name'], $validated['guest_email'] ?? null);

        $fileUrl = null;
        $thumbnail = $validated['thumbnail'] ?? null;
        $assets = [];
        $mediaUuids = $validated['media_uuids'] ?? [];

        if (! empty($mediaUuids)) {
            $medias = Media::whereIn('uuid', $mediaUuids)->get()->keyBy('uuid');
            foreach ($mediaUuids as $uuid) {
                $media = $medias->get($uuid);
                if (! $media) {
                    continue;
                }
                if (! $media->guest_identity_id) {
                    $media->update(['guest_identity_id' => $guest->id]);
                }
                $type = $this->inferMediaType($media);
                $url = $media->url();
                $assets[] = ['media_uuid' => $media->uuid, 'url' => $url, 'type' => $type, 'title' => $media->original_name];
                if (! $fileUrl) {
                    $fileUrl = $url;
                    $validated['type'] = $type;
                    $thumbnail = $media->thumbnail ? Storage::disk($media->disk)->url($media->thumbnail) : ($type === 'photo' ? $url : null);
                }
            }
        }

        if (empty($assets)) {
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $mime = $file->getMimeType() ?: $file->getClientMimeType();
                    $isVideo = str_contains((string) $mime, 'video');
                    try {
                        $media = $isVideo ? $this->mediaManager->uploadVideo($file) : $this->mediaManager->uploadImage($file);
                        $media->update(['guest_identity_id' => $guest->id]);
                        $type = $this->inferMediaType($media);
                        $url = $media->url();
                        $assets[] = ['media_uuid' => $media->uuid, 'url' => $url, 'type' => $type, 'title' => $file->getClientOriginalName()];
                        if (! $fileUrl) {
                            $fileUrl = $url;
                            $validated['type'] = $type;
                            $thumbnail = $media->thumbnail ? Storage::disk($media->disk)->url($media->thumbnail) : null;
                        }
                    } catch (\Throwable) {
                        continue;
                    }
                }
            }

            if ($request->hasFile('thumbnail') && ! $thumbnail) {
                $path = $request->file('thumbnail')->store('stories/events/'.$event->id.'/guest-thumbnails', 'public');
                $thumbnail = Storage::url($path);
            }
        } else {
            if ($request->hasFile('thumbnail') && ! $thumbnail) {
                $path = $request->file('thumbnail')->store('stories/events/'.$event->id.'/guest-thumbnails', 'public');
                $thumbnail = Storage::url($path);
            }
        }

        if (empty($thumbnail) && $validated['type'] === 'photo' && $fileUrl) {
            $thumbnail = $fileUrl;
        }

        if (! $fileUrl && empty($assets)) {
            return redirect()->back()->withErrors(['files' => 'Please upload a file.']);
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

    /**
     * Download all media from a shared event as a ZIP file.
     */
    public function downloadEventMedia(string $slug)
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $stories = $event->stories;
        $files = [];

        foreach ($stories as $story) {
            $storyPrefix = 'story_'.$story->id.'_';

            if (! empty($story->file_url)) {
                $content = $this->fetchUrlContent($story->file_url);
                if ($content) {
                    $ext = pathinfo(parse_url($story->file_url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'bin';
                    $files[] = ['content' => $content, 'name' => $storyPrefix.'main.'.$ext];
                }
            }

            if (! empty($story->assets)) {
                foreach ($story->assets as $index => $asset) {
                    $assetUrl = $asset['url'] ?? null;
                    if ($assetUrl) {
                        $content = $this->fetchUrlContent($assetUrl);
                        if ($content) {
                            $ext = pathinfo(parse_url($assetUrl, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'bin';
                            $files[] = ['content' => $content, 'name' => $storyPrefix.'asset_'.($index + 1).'.'.$ext];
                        }
                    }
                }
            }

            if (! empty($story->thumbnail) && $story->thumbnail !== $story->file_url) {
                $content = $this->fetchUrlContent($story->thumbnail);
                if ($content) {
                    $ext = pathinfo(parse_url($story->thumbnail, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                    $files[] = ['content' => $content, 'name' => $storyPrefix.'thumbnail.'.$ext];
                }
            }
        }

        if (empty($files)) {
            return back()->with('error', 'No media files found in this event.');
        }

        $sanitizedName = Str::slug($event->name, '_');
        $zipFilename = "{$sanitizedName}_media.zip";
        $zipPath = storage_path("app/{$zipFilename}");

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return back()->with('error', 'Could not create ZIP file.');
        }

        foreach ($files as $file) {
            $zip->addFromString($file['name'], $file['content']);
        }
        $zip->close();

        return response()->download($zipPath, $zipFilename, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Fetch content from a URL.
     */
    protected function fetchUrlContent(string $url): ?string
    {
        try {
            $context = stream_context_create([
                'http' => ['timeout' => 30, 'user_agent' => 'Ulo of Stories/1.0'],
                'ssl' => ['verify_peer' => false],
            ]);
            $content = @file_get_contents($url, false, $context);

            return $content !== false ? $content : null;
        } catch (\Throwable $e) {
            logger()->warning('Failed to fetch URL content for download', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        }
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
