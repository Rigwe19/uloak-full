<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StoryService
{
    public function __construct(
        private AssemblyAIService $assemblyAIService
    ) {}

    public function createStory(User $user, Room|Event $space, array $data): Story
    {
        $fileUrl = null;
        $assets = [];
        $folderPrefix = $space instanceof Room ? 'rooms' : 'events';
        $spaceId = $space->id;

        if (isset($data['files']) && is_array($data['files'])) {
            foreach ($data['files'] as $file) {
                if ($file instanceof UploadedFile) {
                    $path = $file->store('stories/'.$folderPrefix.'/'.$spaceId.'/assets', 'public');
                    $url = Storage::url($path);

                    $mime = $file->getMimeType();
                    $type = 'photo';
                    if ($mime === 'application/pdf') {
                        $type = 'pdf';
                    } elseif (str_contains($mime, 'video')) {
                        $type = 'video';
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
        }

        // Handle single file (legacy or specific upload)
        if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
            $path = $data['file']->store('stories/'.$folderPrefix.'/'.$spaceId, 'public');
            $fileUrl = Storage::url($path);
        }

        // Handle recording specifically if it comes as a blob
        if (isset($data['recording']) && $data['recording'] instanceof UploadedFile) {
            $path = $data['recording']->store('stories/'.$folderPrefix.'/'.$spaceId.'/audio', 'public');
            $fileUrl = Storage::url($path);
            $fullPath = storage_path('app/public/'.$path);

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
}
