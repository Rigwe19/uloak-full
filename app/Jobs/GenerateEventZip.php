<?php

namespace App\Jobs;

use App\Mail\DownloadReadyMail;
use App\Models\DownloadRequest;
use App\Models\Event;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class GenerateEventZip implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Event $event,
        public string $email,
    ) {}

    public function handle(): void
    {
        $files = [];

        foreach ($this->event->stories as $story) {
            $prefix = 'story_'.$story->id.'_';

            if (! empty($story->file_url)) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($story->file_url, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = ['path' => $absolutePath, 'name' => $prefix.'main_'.basename($relativePath)];
                }
            }

            foreach ($story->assets ?? [] as $index => $asset) {
                $assetUrl = $asset['url'] ?? null;
                if ($assetUrl) {
                    $relativePath = preg_replace('#^storage/#', '', ltrim($assetUrl, '/'));
                    $absolutePath = Storage::disk('public')->path($relativePath);
                    if (file_exists($absolutePath)) {
                        $files[] = ['path' => $absolutePath, 'name' => $prefix.'asset_'.($index + 1).'_'.basename($relativePath)];
                    }
                }
            }
        }

        if (empty($files)) {
            return;
        }

        $sanitizedName = Str::slug($this->event->name, '_');
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
            'event_id' => $this->event->id,
            'email' => $this->email,
            'zip_path' => $zipPath,
            'expires_at' => now()->addHours(48),
        ]);

        $downloadUrl = route('downloads.download', $downloadRequest->token);

        Mail::to($this->email)->send(new DownloadReadyMail(
            $this->email,
            $downloadUrl,
            $this->event->name,
        ));
    }
}
