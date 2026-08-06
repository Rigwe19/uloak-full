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
                $files[] = $this->prepareFile($story->file_url, $prefix.'main');
            }

            foreach ($story->assets ?? [] as $index => $asset) {
                $assetUrl = $asset['url'] ?? null;
                if ($assetUrl) {
                    $files[] = $this->prepareFile($assetUrl, $prefix.'asset_'.($index + 1));
                }
            }
        }

        $files = array_values(array_filter($files));

        if (empty($files)) {
            logger()->warning('files are empty', [
                'stories' => $this->event->stories,
            ]);

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
            logger()->warning('failed to create zip');

            return;
        }

        foreach ($files as $file) {
            if (isset($file['content'])) {
                $zip->addFromString($file['name'], $file['content']);
            } elseif (isset($file['path'])) {
                $zip->addFile($file['path'], $file['name']);
            }
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
        logger()->info('finish creating and sending');
    }

    protected function prepareFile(string $url, string $baseName): ?array
    {
        $fileName = $baseName.'_'.basename(parse_url($url, PHP_URL_PATH) ?: 'file');

        if (filter_var($url, FILTER_VALIDATE_URL)) {
            try {
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 30,
                        'user_agent' => 'Ulo of Stories/1.0',
                    ],
                    'ssl' => [
                        'verify_peer' => false,
                    ],
                ]);

                $content = @file_get_contents($url, false, $context);

                if ($content !== false) {
                    return [
                        'content' => $content,
                        'name' => $fileName,
                    ];
                }
            } catch (\Throwable $e) {
                logger()->warning('Failed to fetch remote media for zip', [
                    'url' => $url,
                    'error' => $e->getMessage(),
                ]);
            }
        } else {
            $relativePath = preg_replace('#^storage/#', '', ltrim($url, '/'));
            $absolutePath = Storage::disk('public')->path($relativePath);

            if (file_exists($absolutePath)) {
                return [
                    'path' => $absolutePath,
                    'name' => $fileName,
                ];
            }
        }

        return null;
    }
}
