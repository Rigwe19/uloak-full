<?php

namespace App\Services;

use App\Media\MediaManager;
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
    ) {}

    public function createStory(User $user, Room $room, array $data): Story
    {
        $story = $room->stories()->create([
            'uuid' => (string) \Str::uuid(),
            'title' => $data['title'],
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
            foreach ($data['media_uuids'] as $uuid) {
                $media = Media::where('uuid', $uuid)->first();

                if (! $media) {
                    continue;
                }

                $type = 'photo';
                if ($media->mime_type === 'application/pdf') {
                    $type = 'pdf';
                } elseif (str_contains($media->mime_type, 'video')) {
                    $type = 'video';
                } elseif (str_contains($media->mime_type, 'audio')) {
                    $type = 'audio';
                }

                $story->update([
                    'type' => $type,
                    'file_url' => $media->path,
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

        if ($path && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }

        // Delete thumbnail if exists
        if ($media->thumbnail && Storage::disk($disk)->exists($media->thumbnail)) {
            Storage::disk($disk)->delete($media->thumbnail);
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
}
