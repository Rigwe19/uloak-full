<?php

namespace App\Jobs;

use App\Media\Contracts\VideoProcessor;
use App\Media\Repositories\MediaRepository;
use App\Models\Media;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessMediaVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public function __construct(
        public int $mediaId,
        public string $action = 'compress',
        public array $options = [],
    ) {}

    public function handle(MediaRepository $repository, VideoProcessor $videoProcessor): void
    {
        $media = $repository->findById($this->mediaId);

        if (! $media) {
            return;
        }

        try {
            $media = match ($this->action) {
                'compress' => $videoProcessor->compress($media, $this->options),
                'optimize' => $videoProcessor->optimize($media),
                'thumbnail' => $videoProcessor->thumbnail($media, $this->options),
                'resize' => $videoProcessor->resize(
                    $media,
                    $this->options['width'] ?? 1280,
                    $this->options['height'] ?? 720,
                ),
                default => throw new \InvalidArgumentException("Unknown action: {$this->action}"),
            };

            $repository->update($media, [
                'metadata' => array_merge($media->metadata ?? [], [
                    'processed_at' => now()->toIso8601String(),
                    'process_action' => $this->action,
                ]),
            ]);
        } catch (\Throwable $e) {
            $repository->update($media, [
                'metadata' => array_merge($media->metadata ?? [], [
                    'process_failed_at' => now()->toIso8601String(),
                    'process_error' => $e->getMessage(),
                ]),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        $media = Media::find($this->mediaId);

        if ($media) {
            $media->update([
                'metadata' => array_merge($media->metadata ?? [], [
                    'process_failed_at' => now()->toIso8601String(),
                    'process_error' => $e->getMessage(),
                ]),
            ]);
        }
    }
}
