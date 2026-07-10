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
        private AssemblyAIService $assemblyAIService,
        private MediaManager $mediaManager,
    ) {}

    public function createStory(User $user, Room|Event $space, array $data): Story
    {
        $fileUrl = null;
        $assets = [];

        if (isset($data['files']) && is_array($data['files'])) {
            foreach ($data['files'] as $file) {
                if ($file instanceof UploadedFile) {
                    $media = $this->uploadViaPipeline($file);
                    $url = $media->url();

                    $type = 'photo';
                    if ($media->mime_type === 'application/pdf') {
                        $type = 'pdf';
                    } elseif (str_contains($media->mime_type, 'video')) {
                        $type = 'video';
                    }

                    $assets[] = [
                        'url' => $url,
                        'type' => $type,
                        'title' => $media->original_name,
                        'media_uuid' => $media->uuid,
                    ];

                    if (! $fileUrl) {
                        $fileUrl = $url;
                    }
                }
            }
        }

        // Handle pre-uploaded media UUIDs (Cloudinary direct upload)
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

                $assets[] = [
                    'url' => $media->url(),
                    'type' => $type,
                    'title' => $media->original_name,
                    'media_uuid' => $media->uuid,
                ];

                if (! $fileUrl) {
                    $fileUrl = $media->url();
                }
            }
        }

        // Handle single file (legacy or specific upload)
        if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
            $media = $this->uploadViaPipeline($data['file']);
            $fileUrl = $media->url();
        }

        // Handle recording specifically if it comes as a blob
        if (isset($data['recording']) && $data['recording'] instanceof UploadedFile) {
            $media = $this->mediaManager->uploadAudio($data['recording']);
            $fileUrl = $media->url();
            $fullPath = Storage::disk($media->disk)->path($media->path);

            $storyData = [
                'user_id' => $user->id,
                'title' => $data['title'] ?? 'New Memory',
                'type' => 'audio',
                'description' => $data['description'] ?? '',
                'file_url' => $fileUrl,
                'duration' => $data['duration'] ?? null,
                'thumbnail' => $fileUrl,
                'transcript_status' => 'processing',
                'assets' => $assets,
            ];

            if ($space instanceof Room) {
                $storyData['room_id'] = $space->id;
            } else {
                $storyData['event_id'] = $space->id;
            }

            $story = Story::create($storyData);

            $audioUrl = $this->assemblyAIService->uploadFile($fullPath);
            $transcriptId = $this->assemblyAIService->createTranscript(
                $audioUrl,
                url('/api/webhooks/assemblyai')
            );

            $story->update(['transcript_id' => $transcriptId]);

            return $story;
        }

        $type = $data['type'] ?? 'photo';
        if (count($assets) > 1) {
            $type = 'collection';
        }

        $storyData = [
            'user_id' => $user->id,
            'title' => $data['title'] ?? 'New Memory',
            'type' => $type,
            'description' => $data['description'] ?? '',
            'file_url' => $fileUrl,
            'duration' => $data['duration'] ?? null,
            'thumbnail' => $data['thumbnail'] ?? $fileUrl,
            'assets' => $assets,
        ];

        if ($space instanceof Room) {
            $storyData['room_id'] = $space->id;
        } else {
            $storyData['event_id'] = $space->id;
        }

        return Story::create($storyData);
    }

    protected function uploadViaPipeline(UploadedFile $file): Media
    {
        $mime = $file->getMimeType() ?: $file->getClientMimeType();

        if (str_starts_with($mime, 'video/')) {
            return $this->mediaManager->uploadVideo($file);
        }

        return $this->mediaManager->uploadImage($file);
    }
}
