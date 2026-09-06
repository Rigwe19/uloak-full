<?php

namespace App\Http\Controllers;

use App\Media\MediaManager;
use App\Models\Media;
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
    public function __construct(protected MediaManager $mediaManager) {}

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
            ->with([
                'comments' => function ($q) {
                    $q->latest();
                },
                'followUpStories',
            ])
            ->latest()
            ->cursorPaginate(24)
            ->through(function ($story) {
                $assets = $story->assets ?? [];
                $isProcessing = false;
                $enrichedAssets = $assets;
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
                            }

                            return $asset;
                        })->all();
                    }
                } elseif ($story->type === 'video' && empty($story->file_url)) {
                    $isProcessing = true;
                }

                $thumb = $story->thumbnail;
                if ($thumb && ! str_starts_with($thumb, 'http') && ! str_starts_with($thumb, '/storage')) {
                    $thumb = Storage::disk('public')->url(ltrim($thumb, '/'));
                }
                $fileUrl = $story->file_url;
                if ($fileUrl && ! str_starts_with($fileUrl, 'http') && ! str_starts_with($fileUrl, '/storage')) {
                    $fileUrl = Storage::disk('public')->url(ltrim($fileUrl, '/'));
                }
                $enrichedAssets = collect($enrichedAssets)->map(function ($asset) {
                    if (isset($asset['url']) && $asset['url'] && ! str_starts_with($asset['url'], 'http') && ! str_starts_with($asset['url'], '/storage')) {
                        $asset['url'] = Storage::disk('public')->url(ltrim($asset['url'], '/'));
                    }

                    return $asset;
                })->all();

                return [
                    'id' => $story->id,
                    'title' => $story->title,
                    'type' => $story->type,
                    'description' => $story->description,
                    'author' => $story->user?->name ?? $story->roomMember?->name ?? $story->getGuestName() ?? 'Anonymous',
                    'thumbnail' => $thumb,
                    'file_url' => $fileUrl,
                    'assets' => $enrichedAssets,
                    'is_processing' => $isProcessing,
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
                ];
            });

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
            'media_uuids' => ['nullable', 'array'],
            'media_uuids.*' => ['uuid', 'exists:media,uuid'],
        ]);

        $fileUrl = null;
        $assets = [];
        $mediaUuids = $validated['media_uuids'] ?? [];

        // Pending pipeline: media already uploaded via /api/media/* (processing placeholder)
        if (! empty($mediaUuids)) {
            $medias = Media::whereIn('uuid', $mediaUuids)->get()->keyBy('uuid');
            foreach ($mediaUuids as $uuid) {
                $media = $medias->get($uuid);
                if (! $media) {
                    continue;
                }
                $type = $media->type === 'video' ? 'video' : ($media->type === 'audio' ? 'audio' : 'photo');
                $assets[] = [
                    'media_uuid' => $media->uuid,
                    'url' => $media->url(),
                    'type' => $type,
                    'title' => $media->original_name,
                    'status' => $media->status,
                ];
                if (! $fileUrl) {
                    $fileUrl = $media->url();
                    $validated['type'] = $type;
                }
            }
        }

        // Legacy fallback: direct files/recording now via Media pipeline (pending)
        if (empty($assets) && $request->hasFile('recording')) {
            $recording = $request->file('recording');
            $mime = strtolower(trim(explode(';', $recording->getMimeType() ?: '')[0]));
            $isAudio = str_contains($mime, 'audio') || $validated['type'] === 'audio';
            $media = $isAudio ? $this->mediaManager->uploadAudio($recording) : $this->mediaManager->uploadVideo($recording);
            $fileUrl = $media->url();
            $assets[] = [
                'media_uuid' => $media->uuid,
                'url' => $fileUrl,
                'type' => $validated['type'],
                'title' => $recording->getClientOriginalName(),
                'status' => $media->status,
            ];
        }

        if (empty($assets) && $request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $mime = strtolower(trim(explode(';', $file->getMimeType() ?: '')[0]));
                $isVideo = str_starts_with($mime, 'video/');
                $isAudio = str_contains($mime, 'audio');
                try {
                    $media = $isVideo ? $this->mediaManager->uploadVideo($file) : ($isAudio ? $this->mediaManager->uploadAudio($file) : $this->mediaManager->uploadImage($file));
                } catch (\Throwable) {
                    $path = $file->store('stories/rooms/'.$room->id.'/family-assets', 'public');
                    $url = Storage::url($path);
                    $type = $isVideo ? 'video' : ($isAudio ? 'audio' : 'photo');
                    $assets[] = ['url' => $url, 'type' => $type, 'title' => $file->getClientOriginalName()];
                    if (! $fileUrl) {
                        $fileUrl = $url;
                        $validated['type'] = $type;
                    }

                    continue;
                }
                $type = $media->type === 'video' ? 'video' : ($media->type === 'audio' ? 'audio' : 'photo');
                $url = $media->url();
                $assets[] = [
                    'media_uuid' => $media->uuid,
                    'url' => $url,
                    'type' => $type,
                    'title' => $file->getClientOriginalName(),
                    'status' => $media->status,
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

        // Delete associated media/files
        $media = $story->media;

        if ($media) {
            $this->deleteMediaFiles($media);
            $media->delete();
        }

        $story->delete();

        return redirect()
            ->back()
            ->with('success', 'Story deleted.');
    }

    /**
     * Logout from family member session.
     */
    public function logout(): RedirectResponse
    {
        session()->forget(['family_member_id', 'family_member_name', 'family_member_email']);

        return redirect()->route('home');
    }

    protected function deleteMediaFiles(Media $media): void
    {
        $disk = Storage::disk($media->disk ?? 'public');

        $paths = [];

        // Main media file
        if (! empty($media->path)) {
            $paths[] = $this->storagePath($media->path);
        }

        // Thumbnail
        if (! empty($media->thumbnail)) {
            $paths[] = $this->storagePath($media->thumbnail);
        }

        // Sprite can be an array containing image + VTT
        if (! empty($media->sprite)) {
            $sprite = $media->sprite;

            if (is_string($sprite)) {
                $paths[] = $this->storagePath($sprite);
            } elseif (is_array($sprite)) {
                if (! empty($sprite['image'])) {
                    $paths[] = $this->storagePath($sprite['image']);
                }

                if (! empty($sprite['vtt'])) {
                    $paths[] = $this->storagePath($sprite['vtt']);
                }
            }
        }

        // Remove duplicates and empty paths
        $paths = array_values(array_unique(array_filter($paths)));

        if ($paths) {
            $disk->delete($paths);
        }
    }

    protected function storagePath(string $value): string
    {
        // If the database accidentally contains a full URL,
        // convert it back to the storage-relative path.
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            $parsed = parse_url($value, PHP_URL_PATH);

            if ($parsed) {
                return ltrim(
                    preg_replace('#^/storage/#', '', $parsed),
                    '/'
                );
            }
        }

        return ltrim($value, '/');
    }
}
