<?php

namespace App\Services;

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

    public function createStory(User $user, Room $room, array $data): Story
    {
        $fileUrl = null;
        $assets = [];

        if (isset($data['files']) && is_array($data['files'])) {
            foreach ($data['files'] as $file) {
                if ($file instanceof UploadedFile) {
                    $path = $file->store('stories/'.$room->id.'/assets', 'public');
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
            $path = $data['file']->store('stories/'.$room->id, 'public');
            $fileUrl = Storage::url($path);
        }

        // Handle recording specifically if it comes as a blob
        if (isset($data['recording']) && $data['recording'] instanceof UploadedFile) {
            $path = $data['recording']->store('stories/'.$room->id.'/audio', 'public');
            $fileUrl = Storage::url($path);
            $fullPath = storage_path('app/public/'.$path);

            $story = Story::create([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'title' => $data['title'] ?? 'New Memory',
                'type' => 'audio',
                'description' => $data['description'] ?? '',
                'file_url' => $fileUrl,
                'duration' => $data['duration'] ?? null,
                'thumbnail' => $fileUrl,
                'transcript_status' => 'processing',
                'assets' => $assets,
            ]);

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

        return Story::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'title' => $data['title'] ?? 'New Memory',
            'type' => $type,
            'description' => $data['description'] ?? '',
            'file_url' => $fileUrl,
            'duration' => $data['duration'] ?? null,
            'thumbnail' => $data['thumbnail'] ?? $fileUrl,
            'assets' => $assets,
        ]);
    }
}
