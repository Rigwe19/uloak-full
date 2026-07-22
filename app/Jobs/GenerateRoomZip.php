<?php

namespace App\Jobs;

use App\Mail\DownloadReadyMail;
use App\Models\DownloadRequest;
use App\Models\Room;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class GenerateRoomZip implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Room $room,
        public string $email,
    ) {}

    public function handle(): void
    {
        $files = [];

        foreach ($this->room->tributes as $tribute) {
            $prefix = Str::slug($tribute->name, '_').'_';

            foreach ($tribute->images ?? [] as $image) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($image, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = ['path' => $absolutePath, 'name' => $prefix.'image_'.basename($relativePath)];
                }
            }

            if (! empty($tribute->video)) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($tribute->video, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = ['path' => $absolutePath, 'name' => $prefix.'video_'.basename($relativePath)];
                }
            }

            if (! empty($tribute->audio)) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($tribute->audio, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = ['path' => $absolutePath, 'name' => $prefix.'audio_'.basename($relativePath)];
                }
            }
        }

        foreach ($this->room->stories as $story) {
            $storyPrefix = 'story_'.$story->id.'_';

            if (! empty($story->file_url)) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($story->file_url, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = ['path' => $absolutePath, 'name' => $storyPrefix.'main_'.basename($relativePath)];
                }
            }

            foreach ($story->assets ?? [] as $index => $asset) {
                $assetUrl = $asset['url'] ?? null;
                if ($assetUrl) {
                    $relativePath = preg_replace('#^storage/#', '', ltrim($assetUrl, '/'));
                    $absolutePath = Storage::disk('public')->path($relativePath);
                    if (file_exists($absolutePath)) {
                        $files[] = ['path' => $absolutePath, 'name' => $storyPrefix.'asset_'.($index + 1).'_'.basename($relativePath)];
                    }
                }
            }
        }

        if (empty($files)) {
            return;
        }

        $sanitizedName = Str::slug($this->room->name, '_');
        $zipFilename = "{$sanitizedName}_media.zip";
        $zipPath = "downloads/{$zipFilename}";

        $zipFullPath = Storage::disk('public')->path($zipPath);

        if (! is_dir(dirname($zipFullPath))) {
            mkdir(dirname($zipFullPath), 0755, true);
        }

        $zip = new ZipArchive;
        if ($zip->open($zipFullPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return;
        }

        foreach ($files as $file) {
            $zip->addFile($file['path'], $file['name']);
        }
        $zip->close();

        $downloadRequest = DownloadRequest::create([
            'room_id' => $this->room->id,
            'email' => $this->email,
            'zip_path' => $zipPath,
            'expires_at' => now()->addHours(48),
        ]);

        $downloadUrl = route('downloads.download', $downloadRequest->token);

        Mail::to($this->email)->send(new DownloadReadyMail(
            $this->email,
            $downloadUrl,
            $this->room->name,
        ));
    }
}
