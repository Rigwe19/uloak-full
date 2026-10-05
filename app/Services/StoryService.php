<?php

namespace App\Services;

use App\Media\MediaManager;
use App\Models\Event;
use App\Models\Media;
use App\Models\PersonStoryLink;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StoryService
{
    public function __construct(
        protected MediaManager $mediaManager,
        protected PersonScope $personScope,
    ) {}

    public function createStory(User $user, Room|Event $room, array $data): Story
    {
        $scopeOwner = $this->scopeOwnerFor($room, $user);

        // Fail closed before any media work: no story is created with partial tagging.
        $taggedPeople = null;
        if (array_key_exists('person_ids', $data) && $data['person_ids'] !== null) {
            $taggedPeople = $this->personScope->assertLinkableMany($scopeOwner, (array) $data['person_ids']);
        }

        $story = $room->stories()->create([
            'uuid' => (string) \Str::uuid(),
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? 'photo',
            'duration' => $data['duration'] ?? null,
            'user_id' => $user->id,
            'guest_name' => $data['guest_name'] ?? null,
            'metadata' => [
                'thumbnail' => $data['thumbnail'] ?? null,
                'recording' => $data['recording'] ?? null,
            ],
        ]);

        if (isset($data['thumbnail']) && $data['thumbnail'] instanceof UploadedFile) {
            $media = $this->mediaManager->uploadImage($data['thumbnail']);
            $story->update(['thumbnail' => $media->path]);
        }

        if (isset($data['tribute_song']) && $data['tribute_song'] instanceof UploadedFile) {
            $media = $this->mediaManager->uploadAudio($data['tribute_song']);
            $story->update(['tributes_song' => $media->path]);
        }

        if (isset($data['files']) && is_array($data['files'])) {
            $assets = [];
            foreach ($data['files'] as $file) {
                if ($file instanceof UploadedFile) {
                    $media = $this->uploadViaPipeline($file);
                    if ($media) {
                        $assets[] = [
                            'media_uuid' => $media->uuid,
                            'url' => $media->url(),
                            'type' => $media->type,
                            'created_at' => now()->toIso8601String(),
                        ];
                    }
                }
            }

            if (! empty($assets)) {
                $story->update(['assets' => $assets]);
            }
        }

        // Handle pre-uploaded media UUIDs
        if (isset($data['media_uuids']) && is_array($data['media_uuids'])) {
            $assets = [];

            foreach ($data['media_uuids'] as $uuid) {
                $media = Media::where('uuid', $uuid)->first();

                if (! $media) {
                    continue;
                }

                $type = match (true) {
                    $media->mime_type === 'application/pdf' => 'pdf',
                    str_contains($media->mime_type, 'video') => 'video',
                    str_contains($media->mime_type, 'audio') => 'audio',
                    default => 'photo',
                };

                $assets[] = [
                    'media_uuid' => $media->uuid,
                    'url' => $media->url(),
                    'type' => $type,
                    'created_at' => now()->toIso8601String(),
                ];

                // Keep the existing Story columns populated.
                $story->update([
                    'type' => $type,
                    'file_url' => $media->path,
                    'thumbnail' => $media->thumbnail,
                    'duration' => $media->duration,
                ]);
            }

            if (! empty($assets)) {
                $story->update([
                    'assets' => $assets,
                ]);
            }
        }

        if (isset($data['type']) && $data['type'] === 'collection') {
            if (isset($data['media_items']) && is_array($data['media_items'])) {
                $assets = [];
                foreach ($data['media_items'] as $item) {
                    if (isset($item['media_uuid'])) {
                        $media = Media::where('uuid', $item['media_uuid'])->first();
                        if ($media) {
                            $assets[] = [
                                'media_uuid' => $media->uuid,
                                'url' => $media->url(),
                                'type' => $media->type,
                                'created_at' => now()->toIso8601String(),
                            ];
                        }
                    }
                }
                $story->update(['assets' => $assets]);
            }
        }

        if ($taggedPeople !== null) {
            $this->syncTaggedPeople($story, $scopeOwner, $taggedPeople->pluck('id')->all());
        }

        return $story;
    }

    /**
     * Resolve the ownership scope tagging is validated against: the room/event
     * creator's family archive. Falls back to the contributor when the parent
     * has no resolvable creator (defensive; all current callers have one).
     */
    public function scopeOwnerFor(Room|Event $room, ?User $contributor = null): ?User
    {
        $creatorId = $room->created_by ?? null;

        if ($creatorId !== null) {
            $creator = User::find($creatorId);

            if ($creator !== null) {
                return $creator;
            }
        }

        return $contributor ?? auth()->user();
    }

    /**
     * Pre-create guard for controllers that build stories directly: fails closed
     * before the story exists when any submitted person id is out of scope.
     *
     * @param  array<int>|null  $personIds
     */
    public function assertStoryTagsAllowed(Room $room, ?array $personIds): void
    {
        if ($personIds === null) {
            return;
        }

        $owner = $this->scopeOwnerFor($room);
        abort_unless($owner !== null, 403, 'People tagging is unavailable for this room.');

        $this->personScope->assertLinkableMany($owner, $personIds);
    }

    /**
     * Post-create sync for controllers that build stories directly.
     *
     * @param  array<int>|null  $personIds  null = field absent, leave links unchanged.
     */
    public function syncStoryTags(Story $story, Room $room, ?array $personIds): void
    {
        if ($personIds === null) {
            return;
        }

        $owner = $this->scopeOwnerFor($room);
        abort_unless($owner !== null, 403, 'People tagging is unavailable for this room.');

        $this->syncTaggedPeople($story, $owner, $personIds);
    }

    /**
     * Synchronise structured people tagging for a story.
     *
     * Only manages `role=mentioned` links (the tagging role); any other roles
     * are left untouched. Never touches `stories.tags` free-form JSON.
     *
     * @param  array<int>|null  $personIds  null = field absent, leave links unchanged.
     *
     * @throws ValidationException
     */
    public function syncTaggedPeople(Story $story, User $scopeOwner, ?array $personIds): void
    {
        if ($personIds === null) {
            return;
        }

        $people = $this->personScope->assertLinkableMany($scopeOwner, $personIds);
        $ids = $people->pluck('id')->all();

        $query = $story->personLinks()->where('role', 'mentioned');

        if ($ids === []) {
            $query->delete();
        } else {
            $query->whereNotIn('person_id', $ids)->delete();
        }

        foreach ($ids as $id) {
            PersonStoryLink::firstOrCreate(
                ['person_id' => $id, 'story_id' => $story->id, 'role' => 'mentioned'],
            );
        }
    }

    protected function uploadViaPipeline(UploadedFile $file): ?Media
    {
        $mimeType = $file->getMimeType();

        if (str_contains($mimeType, 'video')) {
            return $this->mediaManager->uploadVideo($file);
        }

        if (str_contains($mimeType, 'audio')) {
            return $this->mediaManager->uploadAudio($file);
        }

        return $this->mediaManager->uploadImage($file);
    }

    public function deleteMedia(Media $media): bool
    {
        // Delete file from storage
        $disk = $media->disk ?? 'public';
        $path = $media->path;
        $paths = [];
        logger()->info("Deleting media UUID: {$media->uuid}, Path: {$path}, Disk: {$disk}");

        if ($path && Storage::disk($disk)->exists($path)) {
            logger()->info("Deleting media file from storage: {$disk}/{$path}");
            Storage::disk($disk)->delete($path);
        }

        // Delete thumbnail if exists
        if ($media->thumbnail && Storage::disk($disk)->exists($media->thumbnail)) {
            logger()->info("Deleting thumbnail media: {$disk}/{$media->thumbnail}");
            Storage::disk($disk)->delete($media->thumbnail);
        }

        if (! empty($media->sprite)) {
            logger()->info("Deleting sprite media for media UUID: {$media->uuid}");
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

        $disk = Storage::disk($media->disk ?? 'public');
        // Remove duplicates and empty paths
        $paths = array_values(array_unique(array_filter($paths)));

        if ($paths) {
            $disk->delete($paths);
        }

        // Delete media record
        return $media->delete();
    }

    public function downloadMedia(Media $media): ?string
    {
        $disk = $media->disk ?? 'public';
        $path = $media->path;

        if (! $path || ! Storage::disk($disk)->exists($path)) {
            return null;
        }

        return Storage::disk($disk)->path($path);
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
