<?php

namespace App\Services;

use App\Media\MediaManager;
use App\Models\Event;
use App\Models\Media;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StoryService
{
    public function __construct(
        protected MediaManager $mediaManager,
    ) {
    }

    public function createStory(User $user, Room|Event $room, array $data): Story
    {
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

            if (!empty($assets)) {
                $story->update(['assets' => $assets]);
            }
        }

        // Handle pre-uploaded media UUIDs
        if (isset($data['media_uuids']) && is_array($data['media_uuids'])) {
            $assets = [];

            foreach ($data['media_uuids'] as $uuid) {
                $media = Media::where('uuid', $uuid)->first();

                if (!$media) {
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

            if (!empty($assets)) {
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

        return $story;
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

        if (!empty($media->sprite)) {
            logger()->info("Deleting sprite media for media UUID: {$media->uuid}");
            $sprite = $media->sprite;

            if (is_string($sprite)) {
                $paths[] = $this->storagePath($sprite);
            } elseif (is_array($sprite)) {
                if (!empty($sprite['image'])) {
                    $paths[] = $this->storagePath($sprite['image']);
                }

                if (!empty($sprite['vtt'])) {
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

        if (!$path || !Storage::disk($disk)->exists($path)) {
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
