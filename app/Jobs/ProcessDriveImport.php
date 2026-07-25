<?php

namespace App\Jobs;

use App\Models\Room;
use App\Models\User;
use App\Services\StoryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ProcessDriveImport implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $fileId,
        public string $fileName,
        public int $userId,
        public int $roomId,
        public ?int $eventId = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(StoryService $storyService): void
    {
        $downloadUrl = "https://drive.google.com/uc?export=download&id={$this->fileId}";

        try {
            $response = Http::timeout(120)
                ->withOptions(['allow_redirects' => true])
                ->get($downloadUrl);

            if (! $response->successful()) {
                $response = Http::timeout(120)
                    ->withOptions(['allow_redirects' => true])
                    ->get("https://drive.google.com/uc?export=download&confirm=t&id={$this->fileId}");
            }

            if (! $response->successful()) {
                logger()->warning("Drive import failed for file: {$this->fileId}");
                return;
            }

            $body = $response->body();
            $contentType = $response->header('Content-Type') ?? 'application/octet-stream';
            $extension = $this->guessExtension($contentType);
            $tempPath = "drive-imports/{$this->fileId}_{$this->fileName}.{$extension}";

            Storage::disk('local')->put($tempPath, $body);
            $fullPath = Storage::disk('local')->path($tempPath);

            // Create an UploadedFile from the downloaded file
            $uploadedFile = new UploadedFile(
                $fullPath,
                "{$this->fileName}.{$extension}",
                $contentType,
                null,
                true, // test mode
            );

            $user = User::findOrFail($this->userId);
            $room = Room::findOrFail($this->roomId);

            $data = [
                'title' => $this->fileName,
                'type' => $this->guessMediaType($contentType, $extension),
                'files' => [$uploadedFile],
            ];

            if ($this->eventId) {
                $event = \App\Models\Event::findOrFail($this->eventId);
                $storyService->createStory($user, $event, $data);
            } else {
                $storyService->createStory($user, $room, $data);
            }

            Storage::disk('local')->delete($tempPath);
            logger()->info("Drive import completed: {$this->fileName}");
        } catch (\Exception $e) {
            logger()->error("Drive import error for {$this->fileId}: " . $e->getMessage());
        }
    }

    private function guessExtension(string $contentType): string
    {
        $map = [
            'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif',
            'image/webp' => 'webp', 'video/mp4' => 'mp4', 'video/webm' => 'webm',
            'video/quicktime' => 'mov', 'audio/mpeg' => 'mp3', 'audio/wav' => 'wav',
            'audio/webm' => 'webm', 'application/pdf' => 'pdf',
        ];
        return $map[$contentType] ?? 'bin';
    }

    private function guessMediaType(string $contentType, string $extension): string
    {
        if (str_starts_with($contentType, 'image/')) return 'photo';
        if (str_starts_with($contentType, 'video/')) return 'video';
        if (str_starts_with($contentType, 'audio/')) return 'audio';

        $photoExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
        $audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];

        if (in_array($extension, $photoExts)) return 'photo';
        if (in_array($extension, $videoExts)) return 'video';
        if (in_array($extension, $audioExts)) return 'audio';

        return 'document';
    }
}