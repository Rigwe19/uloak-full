<?php

namespace App\Jobs;

use App\Events\MediaProcessingCompleted;
use App\Events\MediaProcessingFailed;
use App\Events\MediaProcessingProgressed;
use App\Media\Enums\ProcessingState;
use App\Media\Repositories\MediaRepository;
use App\Models\Media;
use FFMpeg\Format\Video\X264;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg as FFMpegFacade;

class ProcessMediaVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public function __construct(
        public int $mediaId,
        public string $action = 'transcode',
        public array $options = [],
    ) {}

    public function handle(MediaRepository $repository): void
    {
        $media = $repository->findById($this->mediaId);

        if (! $media) {
            return;
        }

        $repository->update($media, [
            'status' => ProcessingState::Processing->value,
            'progress' => 0,
            'processing_started_at' => now(),
        ]);

        try {
            match ($this->action) {
                'transcode' => $this->transcodeVideo($media),
                'compress' => $this->compressVideo($media),
                'resize' => $this->resizeVideo($media, $this->options['width'] ?? 1280, $this->options['height'] ?? 720),
                'optimize' => $this->compressVideo($media, ['crf' => 28, 'preset' => 'fast']),
                default => throw new \InvalidArgumentException("Unknown action: {$this->action}"),
            };

            $repository->update($media, [
                'status' => ProcessingState::Ready->value,
                'progress' => 100,
                'processing_completed_at' => now(),
            ]);

            MediaProcessingCompleted::dispatch($media);
        } catch (\Throwable $e) {
            $repository->update($media, [
                'status' => ProcessingState::Failed->value,
                'failed_reason' => $e->getMessage(),
                'processing_completed_at' => now(),
            ]);

            MediaProcessingFailed::dispatch($media, $e->getMessage());

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        logger()->error('Media processing job failed', [
            'media_id' => $this->mediaId,
            'action' => $this->action,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        $media = Media::find($this->mediaId);

        // Guard against double-dispatch: the catch block above already
        // transitioned the media to 'failed' for the normal error path.
        if ($media && $media->status !== ProcessingState::Failed->value) {
            $media->update([
                'status' => ProcessingState::Failed->value,
                'failed_reason' => $e->getMessage(),
                'processing_completed_at' => now(),
            ]);

            MediaProcessingFailed::dispatch($media, $e->getMessage());
        }
    }

    protected function transcodeVideo(Media $media): void
    {
        $diskName = $media->disk;
        $disk = Storage::disk($diskName);

        $processedFilename = Str::uuid().'.mp4';
        $processedPath = $this->processedPath().'/'.$processedFilename;

        $originalVideo = FFMpegFacade::fromDisk($diskName)
            ->open($media->path);

        $metadata = [
            'width' => $originalVideo->getVideoStream()?->get('width'),
            'height' => $originalVideo->getVideoStream()?->get('height'),
            'duration' => (int) round($originalVideo->getDurationInSeconds() ?? 0),
        ];

        $this->runTranscode($diskName, $media->path, $processedPath, $metadata['duration'] ?? 0, $this->options);

        $this->updateProgress($media, 80);

        $posterPath = $this->thumbnailsPath().'/'.pathinfo($processedFilename, PATHINFO_FILENAME).'.jpg';

        $this->generatePoster($diskName, $processedPath, $posterPath);

        $this->updateProgress($media, 90);

        $spriteImage = $this->spritesPath().'/'.pathinfo($processedFilename, PATHINFO_FILENAME).'.jpg';
        $spriteVtt = $this->spritesPath().'/'.pathinfo($processedFilename, PATHINFO_FILENAME).'.vtt';

        $this->generateSprite($diskName, $processedPath, $spriteImage, $spriteVtt, $metadata['duration'] ?? 0);

        $this->updateProgress($media, 95);

        $processedVideo = FFMpegFacade::fromDisk($diskName)
            ->open($processedPath);

        $processed = [
            'width' => $processedVideo->getVideoStream()?->get('width'),
            'height' => $processedVideo->getVideoStream()?->get('height'),
            'duration' => (int) round($processedVideo->getDurationInSeconds() ?? 0),
        ];

        $fileSize = $disk->size($processedPath);

        $this->updateMediaRecord($media, $processedPath, $fileSize, $processed, [
            'thumbnail' => $posterPath,
            'sprite' => ['image' => $spriteImage, 'vtt' => $spriteVtt],
        ]);
    }

    protected function compressVideo(Media $media, array $options = []): void
    {
        $disk = Storage::disk($media->disk);
        $inputPath = $media->path;
        $outputFilename = Str::uuid()->toString().'.mp4';
        $outputPath = $this->processedPath().'/'.$outputFilename;

        $crf = $options['crf'] ?? 23;
        $preset = $options['preset'] ?? 'slow';

        FFMpegFacade::open($disk->path($inputPath))
            ->export()
            ->inFormat(new X264)
            ->addFilter('-preset', $preset)
            ->addFilter('-crf', (string) $crf)
            ->save(Storage::disk($media->disk)->path($outputPath));

        $newMetadata = $this->getVideoMetadataFromDisk($outputPath, $media->disk);
        $fileSize = Storage::disk($media->disk)->size($outputPath);

        $this->updateMediaRecord($media, $outputPath, $fileSize, $newMetadata, []);
    }

    protected function resizeVideo(Media $media, int $width, int $height): void
    {
        $disk = Storage::disk($media->disk);
        $inputPath = $media->path;
        $outputFilename = Str::uuid()->toString().'.mp4';
        $outputPath = $this->processedPath().'/'.$outputFilename;

        FFMpegFacade::open($disk->path($inputPath))
            ->export()
            ->inFormat(new X264)
            ->resize($width, $height)
            ->save(Storage::disk($media->disk)->path($outputPath));

        $newMetadata = $this->getVideoMetadataFromDisk($outputPath, $media->disk);
        $fileSize = Storage::disk($media->disk)->size($outputPath);

        $this->updateMediaRecord($media, $outputPath, $fileSize, $newMetadata, []);
    }

    protected function runTranscode(
        string $disk,
        string $input,
        string $output,
        int $duration,
        array $options = []
    ): void {
        $crf = $options['crf'] ?? 23;
        $preset = $options['preset'] ?? 'slow';

        $storage = Storage::disk($disk);

        $inputPath = $storage->path($input);
        $outputPath = $storage->path($output);

        if (! is_dir(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        $watermarkPath = public_path('ulo-wordmark-forest.png');
        $hasWatermark = file_exists($watermarkPath);
        logger()->info('Transcoding video', [
            'input' => $inputPath,
            'output' => $outputPath,
            'has_watermark' => $hasWatermark,
            'crf' => $crf,
            'preset' => $preset,
        ]);

        $command = [
            'ffmpeg',
            '-y',
            '-i',
            $inputPath,
        ];

        if ($hasWatermark) {
            $command[] = '-i';
            $command[] = $watermarkPath;
        }

        $filter = $hasWatermark
            ? '[1:v]scale=iw/10:-1[wm];[0:v][wm]overlay=W-w-16:H-h-16:format=auto[outv]'
            : '[0:v]null[outv]';

        $command = array_merge($command, [
            '-filter_complex',
            $filter,
            '-map',
            '[outv]',
            '-map',
            '0:a?',
            '-c:v',
            'libx264',
            '-preset',
            $preset,
            '-crf',
            (string) $crf,
            '-pix_fmt',
            'yuv420p',
            '-profile:v',
            'high',
            '-movflags',
            '+faststart',
            '-c:a',
            'aac',
            '-b:a',
            '128k',
            '-progress',
            'pipe:1',
            '-nostats',
            $outputPath,
        ]);

        $process = Process::start($command);

        $lastProgress = 0;
        $lastOutTimeMs = 0;
        $buffer = '';

        while ($process->running()) {
            $buffer .= $process->latestOutput();

            while (($newline = strpos($buffer, "\n")) !== false) {
                $line = trim(substr($buffer, 0, $newline));
                $buffer = substr($buffer, $newline + 1);

                if (! str_starts_with($line, 'out_time_ms=')) {
                    continue;
                }

                $outTimeMs = (int) substr($line, strlen('out_time_ms='));

                // Ignore stale/out-of-order progress.
                if ($outTimeMs <= $lastOutTimeMs) {
                    continue;
                }

                $lastOutTimeMs = $outTimeMs;

                if ($duration <= 0) {
                    continue;
                }

                $percentage = (int) round(
                    ($outTimeMs / 1_000_000 / $duration) * 70
                );

                $percentage = max(5, min(70, $percentage));

                // Never allow progress to go backwards.
                if ($percentage <= $lastProgress) {
                    continue;
                }

                $lastProgress = $percentage;

                $media = Media::find($this->mediaId);

                if ($media) {
                    $this->updateProgress($media, $percentage);
                }
            }

            usleep(200_000);
        }

        $result = $process->wait();

        if ($result->exitCode() !== 0) {
            throw new \RuntimeException(
                'FFmpeg transcoding failed: '.$result->errorOutput()
            );
        }
    }

    protected function mediaForProgress(): ?Media
    {
        return Media::find($this->mediaId);
    }

    protected function updateProgress(Media $media, int $progress): void
    {
        $progress = max(0, min(100, $progress));

        $media->update(['progress' => $progress]);

        MediaProcessingProgressed::dispatch($media, $progress);
    }

    protected function generatePoster(string $disk, string $video, string $output): void
    {
        FFMpegFacade::fromDisk($disk)
            ->open($video)
            ->getFrameFromSeconds(2)
            ->export()
            ->save($output);
    }

    protected function generateSprite(
        string $disk,
        string $video,
        string $sprite,
        string $vtt,
        int $duration,
        int $interval = 5,
        int $thumbWidth = 160,
        int $thumbHeight = 90,
        int $columns = 5,
    ): void {
        $storage = Storage::disk($disk);
        $videoPath = $storage->path($video);
        $spritePath = $storage->path($sprite);

        if (! is_dir(dirname($spritePath))) {
            mkdir(dirname($spritePath), 0755, true);
        }

        $frames = max(1, (int) ceil($duration / $interval));
        $rows = (int) ceil($frames / $columns);

        Process::run([
            'ffmpeg',
            '-y',
            '-i',
            $videoPath,
            '-vf',
            sprintf('fps=1/%d,scale=%d:%d,tile=%dx%d', $interval, $thumbWidth, $thumbHeight, $columns, $rows),
            '-frames:v',
            '1',
            $spritePath,
        ])->throw();

        $this->generateSpriteVtt($disk, $vtt, $duration, $interval, $thumbWidth, $thumbHeight, $columns);
    }

    protected function generateSpriteVtt(
        string $disk,
        string $output,
        int $duration,
        int $interval,
        int $thumbWidth,
        int $thumbHeight,
        int $columns,
    ): void {
        $storage = Storage::disk($disk);
        $filename = basename($output, '.vtt').'.jpg';

        $lines = ['WEBVTT', ''];
        $frames = max(1, (int) ceil($duration / $interval));

        for ($i = 0; $i < $frames; $i++) {
            $start = $i * $interval;
            $end = min(($i + 1) * $interval, $duration);
            $column = $i % $columns;
            $row = intdiv($i, $columns);
            $x = $column * $thumbWidth;
            $y = $row * $thumbHeight;

            $lines[] = $this->formatTimestamp($start).' --> '.$this->formatTimestamp($end);
            $lines[] = basename($output, '.vtt').'.jpg#xywh='
                .$x.','
                .$y.','
                .$thumbWidth.','
                .$thumbHeight;
            $lines[] = '';
        }

        $storage->put($output, implode(PHP_EOL, $lines));
    }

    protected function formatTimestamp(float $seconds): string
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = floor($seconds % 60);
        $milliseconds = ($seconds - floor($seconds)) * 1000;

        return sprintf('%02d:%02d:%02d.%03d', $hours, $minutes, $secs, $milliseconds);
    }

    protected function getVideoMetadataFromDisk(string $path, string $disk): array
    {
        $ffmpeg = FFMpegFacade::open(Storage::disk($disk)->path($path));

        return [
            'width' => $ffmpeg->getVideoStream()?->get('width'),
            'height' => $ffmpeg->getVideoStream()?->get('height'),
            'duration' => (int) round($ffmpeg->getDurationInSeconds() ?? 0),
        ];
    }

    protected function updateMediaRecord(Media $media, string $newPath, int $newSize, array $metadata, array $extra = []): void
    {
        $updateData = array_merge([
            'path' => $newPath,
            'size' => $newSize,
        ], $extra);

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
    }

    protected function processedPath(): string
    {
        return $this->options['path'] ?? config('media.video.paths.processed', 'media/processed');
    }

    protected function thumbnailsPath(): string
    {
        return $this->options['thumbnails_path'] ?? 'media/thumbnails';
    }

    protected function spritesPath(): string
    {
        return $this->options['sprites_path'] ?? 'media/sprites';
    }
}
