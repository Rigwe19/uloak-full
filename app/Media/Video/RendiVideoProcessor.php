<?php

namespace App\Media\Video;

use App\Jobs\ProcessMediaVideo;
use App\Media\Contracts\VideoProcessor;
use App\Media\Enums\MediaType;
use App\Media\Exceptions\MediaProcessingException;
use App\Media\Exceptions\UnsupportedFormatException;
use App\Media\Repositories\MediaRepository;
use App\Media\Storage\StorageManager;
use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RendiVideoProcessor implements VideoProcessor
{
    protected const SUPPORTED_MIME_TYPES = [
        'video/mp4',
        'application/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
        'video/webm',
    ];

    protected const RENDI_STATUS_SUCCESS = 'SUCCESS';

    protected const RENDI_STATUS_FAILED = 'FAILED';

    public function __construct(
        protected MediaRepository $repository,
        protected StorageManager $storage,
        protected array $config = [],
    ) {}

    public function upload(UploadedFile $file): Media
    {
        $mimeType = $file->getMimeType() ?: $file->getClientMimeType();

        if (! $this->supports($mimeType)) {
            throw new UnsupportedFormatException(
                mimeType: $mimeType,
                driver: 'rendi',
            );
        }

        $path = $this->storage->store($file, $this->originalsPath());
        $checksum = md5_file($file->getRealPath());

        $media = $this->repository->createFromUpload(
            file: $file,
            path: $path,
            disk: $this->storageDisk(),
            type: MediaType::Video,
            checksum: $checksum,
        );

        ProcessMediaVideo::dispatch($media->id, 'compress');

        return $media;
    }

    public function compress(Media $media, array $options = []): Media
    {
        $ffmpeg = '-i {{in_1}} -c:v libx264 -preset slow -crf '.($options['crf'] ?? 23)
            .' -c:a aac -b:a 96k {{out_1}}';

        $commandId = $this->submitCommand($media, $ffmpeg, 'compressed.mp4');

        return $this->pollAndStore($media, $commandId);
    }

    public function resize(Media $media, int $width, int $height): Media
    {
        $ffmpeg = '-i {{in_1}} -vf scale='.$width.':'.$height
            .' -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 96k {{out_1}}';

        $commandId = $this->submitCommand($media, $ffmpeg, 'resized.mp4');

        return $this->pollAndStore($media, $commandId);
    }

    public function thumbnail(Media $media, array $options = []): Media
    {
        $time = $options['time'] ?? '00:00:01';
        $ffmpeg = "-i {{in_1}} -ss {$time} -vframes 1 -q:v 2 {{out_1}}";

        $commandId = $this->submitCommand($media, $ffmpeg, 'thumbnail.jpg');

        $result = $this->pollCommand($commandId);

        if ($result['status'] !== self::RENDI_STATUS_SUCCESS) {
            throw new MediaProcessingException("Rendi thumbnail command [{$commandId}] failed.");
        }

        $outputFile = $result['output_files']['out_1'] ?? [];
        $thumbnailUrl = $outputFile['storage_url'] ?? '';

        if (! $thumbnailUrl) {
            throw new MediaProcessingException('Thumbnail output URL missing from Rendi response.');
        }

        $thumbnailPath = $this->downloadProcessedFile($thumbnailUrl);

        $this->repository->update($media, [
            'metadata' => array_merge($media->metadata ?? [], [
                'thumbnail_path' => $thumbnailPath,
                'thumbnail_disk' => $this->storageDisk(),
            ]),
        ]);

        $media->refresh();

        return $media;
    }

    public function optimize(Media $media): Media
    {
        return $this->compress($media, ['crf' => 28]);
    }

    public function supports(string $mimeType): bool
    {
        return in_array($mimeType, self::SUPPORTED_MIME_TYPES, true);
    }

    public function processAsync(Media $media, string $action, array $options = []): Media
    {
        $ffmpeg = match ($action) {
            'compress' => '-i {{in_1}} -c:v libx264 -preset slow -crf '
                .($options['crf'] ?? 23).' -c:a aac -b:a 96k {{out_1}}',
            'optimize' => '-i {{in_1}} -c:v libx264 -preset slow -crf 28 -c:a aac -b:a 96k {{out_1}}',
            'resize' => '-i {{in_1}} -vf scale='.($options['width'] ?? 1280).':'.($options['height'] ?? 720)
                .' -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 96k {{out_1}}',
            'thumbnail' => '-i {{in_1}} -ss '.($options['time'] ?? '00:00:01').' -vframes 1 -q:v 2 {{out_1}}',
            default => throw new \InvalidArgumentException("Unknown action: {$action}"),
        };

        $outputFile = $action === 'thumbnail' ? 'thumbnail.jpg' : 'processed.mp4';

        $commandId = $this->submitCommand($media, $ffmpeg, $outputFile);

        $this->repository->update($media, [
            'metadata' => array_merge($media->metadata ?? [], [
                'rendi_command_id' => $commandId,
                'rendi_action' => $action,
                'rendi_status' => 'processing',
                'rendi_submitted_at' => now()->toIso8601String(),
            ]),
        ]);

        $media->refresh();

        return $media;
    }

    public function handleCallback(array $payload, ?string $signature = null): Media
    {
        $commandId = $payload['command_id'] ?? null;
        $status = $payload['status'] ?? null;

        if (! $commandId || ! $status) {
            throw new MediaProcessingException('Invalid webhook payload: missing command_id or status.');
        }

        if ($signature !== null) {
            $this->verifyWebhookSignature($payload, $signature);
        }

        $media = $this->repository->findByCommandId($commandId);

        if (! $media) {
            throw new MediaProcessingException("No media found for Rendi command [{$commandId}].");
        }

        if ($status === self::RENDI_STATUS_FAILED) {
            $this->repository->update($media, [
                'metadata' => array_merge($media->metadata ?? [], [
                    'rendi_status' => 'failed',
                    'rendi_error' => $payload['error'] ?? 'Unknown error',
                    'rendi_completed_at' => now()->toIso8601String(),
                ]),
            ]);

            $media->refresh();

            return $media;
        }

        $outputFile = $payload['output_files']['out_1'] ?? [];
        $outputUrl = $outputFile['storage_url'] ?? ($payload['output_url'] ?? null);

        if (! $outputUrl) {
            throw new MediaProcessingException('Webhook payload missing output_url.');
        }

        $newPath = $this->downloadProcessedFile($outputUrl);

        $this->repository->update($media, [
            'path' => $newPath,
            'size' => $this->fileSize($newPath),
            'metadata' => array_merge($media->metadata ?? [], [
                'rendi_status' => 'completed',
                'rendi_command_id' => $commandId,
                'rendi_output' => $payload,
                'rendi_completed_at' => now()->toIso8601String(),
            ]),
        ]);

        $media->refresh();

        return $media;
    }

    protected function submitCommand(Media $media, string $ffmpegCommand, string $outputFilename): string
    {
        $sourceUrl = $this->storage->url($media->path, $media->disk);

        $payload = [
            'input_files' => [
                'in_1' => $sourceUrl,
            ],
            'output_files' => [
                'out_1' => $outputFilename,
            ],
            'ffmpeg_command' => $ffmpegCommand,
        ];

        $response = Http::timeout($this->httpTimeout())
            ->withHeaders(['X-API-KEY' => $this->apiKey()])
            ->post($this->apiUrl('/run-ffmpeg-command'), $payload);

        if ($response->failed()) {
            Log::error('Rendi API error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'ffmpeg_command' => $ffmpegCommand,
                'media_id' => $media->id,
            ]);

            throw new MediaProcessingException(
                "Rendi API returned status [{$response->status()}] for media [{$media->id}]."
            );
        }

        return $response->json('command_id');
    }

    protected function pollCommand(string $commandId): array
    {
        $maxAttempts = 60;
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            $response = Http::timeout($this->httpTimeout())
                ->withHeaders(['X-API-KEY' => $this->apiKey()])
                ->get($this->apiUrl("/commands/{$commandId}"));

            if ($response->failed()) {
                throw new MediaProcessingException(
                    "Failed to poll Rendi command [{$commandId}]: HTTP {$response->status()}."
                );
            }

            $data = $response->json();
            $status = $data['status'] ?? '';

            if (in_array($status, [self::RENDI_STATUS_SUCCESS, self::RENDI_STATUS_FAILED], true)) {
                return $data;
            }

            $attempt++;
            sleep(2);
        }

        throw new MediaProcessingException("Rendi command [{$commandId}] timed out after {$maxAttempts} attempts.");
    }

    protected function pollAndStore(Media $media, string $commandId): Media
    {
        $result = $this->pollCommand($commandId);

        if ($result['status'] !== self::RENDI_STATUS_SUCCESS) {
            throw new MediaProcessingException("Rendi processing command [{$commandId}] failed.");
        }

        $outputFile = $result['output_files']['out_1'] ?? [];
        $outputUrl = $outputFile['storage_url'] ?? '';

        if (! $outputUrl) {
            throw new MediaProcessingException('Output URL missing from Rendi response.');
        }

        $newPath = $this->downloadProcessedFile($outputUrl);

        $this->repository->update($media, [
            'path' => $newPath,
            'size' => $this->fileSize($newPath),
            'metadata' => array_merge($media->metadata ?? [], [
                'rendi_command_id' => $commandId,
                'rendi_output' => $result,
            ]),
        ]);

        $media->refresh();

        return $media;
    }

    protected function downloadProcessedFile(string $url): string
    {
        $response = Http::timeout(120)->get($url);

        if ($response->failed()) {
            throw new MediaProcessingException("Failed to download processed file from [{$url}].");
        }

        $filename = Str::uuid()->toString().'.mp4';
        $path = $this->processedPath().'/'.$filename;

        $this->storage->put($path, $response->body(), $this->storageDisk());

        return $path;
    }

    protected function fileSize(string $path): int
    {
        $contents = $this->storage->get($path, $this->storageDisk());

        return $contents ? strlen($contents) : 0;
    }

    protected function verifyWebhookSignature(array $payload, string $signature): void
    {
        $secret = $this->config['webhook_secret'] ?? '';

        if ($secret === '') {
            return;
        }

        $expected = hash_hmac('sha256', json_encode($payload), $secret);

        if (! hash_equals($expected, $signature)) {
            throw new MediaProcessingException('Invalid webhook signature.');
        }
    }

    protected function apiKey(): string
    {
        return $this->config['api_key'] ?? '';
    }

    protected function apiUrl(string $path = ''): string
    {
        $base = rtrim($this->config['api_url'] ?? 'https://api.rendi.dev/v1', '/');

        return $base.'/'.ltrim($path, '/');
    }

    protected function httpTimeout(): int
    {
        return $this->config['timeout'] ?? 30;
    }

    protected function originalsPath(): string
    {
        return $this->config['paths']['originals'] ?? 'media/originals';
    }

    protected function processedPath(): string
    {
        return $this->config['paths']['processed'] ?? 'media/processed';
    }

    protected function storageDisk(): string
    {
        return $this->config['storage_disk'] ?? 'public';
    }
}
