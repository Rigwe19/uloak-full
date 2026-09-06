<?php

namespace App\Jobs;

use App\Media\Repositories\MediaRepository;
use App\Models\Media;
use FFMpeg\Format\Video\X264;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable as FoundationQueueable;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ProtoneMedia\LaravelFFMpeg\Drivers\UnknownDurationException;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg as FFMpegFacade;

class ProcessVideo implements ShouldQueue
{
    use FoundationQueueable;

    public function __construct(
        protected int $mediaId,
        protected string $action = 'compress',
        protected array $options = [],
    ) {}

    public function handle(MediaRepository $repository): void
    {
        $media = Media::find($this->mediaId);

        if (! $media) {
            return;
        }

        // Update status to processing
        $repository->update($media, ['status' => 'processing']);

        try {
            $result = match ($this->action) {
                'compress' => $this->compress($media),
                'resize' => $this->resize($media, $this->options['width'] ?? 1280, $this->options['height'] ?? 720),
                'thumbnail' => $this->thumbnail($media, $this->options),
                'optimize' => $this->optimize($media),
                default => throw new \InvalidArgumentException("Unknown action: {$this->action}"),
            };

            $repository->update($media, ['status' => 'ready']);
        } catch (\Exception $e) {
            $repository->update($media, [
                'status' => 'failed',
                'failed_reason' => $e->getMessage(),
            ]);
        }
    }

    protected function compress(Media $media): Media
    {
        $disk = Storage::disk($media->disk);
        $inputPath = $media->path;
        $outputFilename = Str::uuid()->toString().'.mp4';
        $outputPath = 'media/processed/'.$outputFilename;

        $crf = $this->options['crf'] ?? 23;
        $preset = $this->options['preset'] ?? 'slow';

        FFMpegFacade::open($disk->path($inputPath))
            ->export()
            ->inFormat(new X264)
            ->addFilter('-preset', $preset)
            ->addFilter('-crf', (string) $crf)
            ->save(Storage::disk($media->disk)->path($outputPath));

        $ffmpeg = FFMpegFacade::open(Storage::disk($media->disk)->path($outputPath));
        $metadata = $this->safeMetadata($ffmpeg, $outputPath, $media->disk);

        return $this->updateMediaRecord($media, $outputPath, Storage::disk($media->disk)->size($outputPath), $metadata);
    }

    protected function resize(Media $media, int $width, int $height): Media
    {
        $disk = Storage::disk($media->disk);
        $inputPath = $media->path;
        $outputFilename = Str::uuid()->toString().'.mp4';
        $outputPath = 'media/processed/'.$outputFilename;

        FFMpegFacade::open($disk->path($inputPath))
            ->export()
            ->inFormat(new X264)
            ->resize($width, $height)
            ->save(Storage::disk($media->disk)->path($outputPath));

        $ffmpeg = FFMpegFacade::open(Storage::disk($media->disk)->path($outputPath));
        $metadata = $this->safeMetadata($ffmpeg, $outputPath, $media->disk);

        return $this->updateMediaRecord($media, $outputPath, Storage::disk($media->disk)->size($outputPath), $metadata);
    }

    protected function thumbnail(Media $media, array $options): Media
    {
        $disk = Storage::disk($media->disk);
        $inputPath = $media->path;
        $outputFilename = Str::uuid()->toString().'.jpg';
        $outputPath = 'media/thumbnails/'.$outputFilename;

        $time = $options['time'] ?? '00:00:01';
        $timeSeconds = $this->parseTimeToSeconds($time);

        FFMpegFacade::open($disk->path($inputPath))
            ->getFrameFromSeconds($timeSeconds)
            ->export()
            ->save(Storage::disk($media->disk)->path($outputPath));

        $repository = app(MediaRepository::class);
        $repository->update($media, [
            'metadata' => array_merge($media->metadata ?? [], [
                'thumbnail_path' => $outputPath,
                'thumbnail_disk' => $media->disk,
            ]),
        ]);

        return $media;
    }

    protected function optimize(Media $media): Media
    {
        return $this->compress($media, ['crf' => 28, 'preset' => 'fast']);
    }

    protected function updateMediaRecord(Media $media, string $newPath, int $newSize, array $metadata): Media
    {
        $updateData = [
            'path' => $newPath,
            'size' => $newSize,
        ];

        if (isset($metadata['width'])) {
            $updateData['width'] = $metadata['width'];
        }
        if (isset($metadata['height'])) {
            $updateData['height'] = $metadata['height'];
        }
        if (isset($metadata['duration'])) {
            $updateData['duration'] = $metadata['duration'];
        }

        $media->update($updateData);

        return $media;
    }

    protected function parseTimeToSeconds(string $timeString): int
    {
        $parts = explode(':', $timeString);
        $seconds = 0;
        $multiplier = 1;

        while (count($parts) > 0) {
            $seconds += array_pop($parts) * $multiplier;
            $multiplier *= 60;
        }

        return $seconds;
    }

    protected function safeMetadata($ffmpeg, string $path, string $disk): array
    {
        $duration = 0;

        try {
            $sec = $ffmpeg->getDurationInSeconds();

            if ($sec !== null && is_numeric($sec) && (float) $sec > 0) {
                $duration = (int) round((float) $sec);
            }
        } catch (UnknownDurationException) {
            try {
                $abs = Storage::disk($disk)->path($path);
                $result = Process::run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', $abs]);

                if ($result->successful()) {
                    $out = trim($result->output());

                    if (is_numeric($out) && (float) $out > 0) {
                        $duration = (int) round((float) $out);
                    }
                }
            } catch (\Throwable) {
            }
        } catch (\Throwable) {
        }

        return [
            'width' => $ffmpeg->getVideoStream()?->get('width'),
            'height' => $ffmpeg->getVideoStream()?->get('height'),
            'duration' => $duration,
        ];
    }
}
