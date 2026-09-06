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
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ProtoneMedia\LaravelFFMpeg\Drivers\UnknownDurationException;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg as FFMpegFacade;

class ProcessMediaVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    /**
     * Serialize video jobs on a 4GB VPS (1 at a time) to avoid OOM.
     * With --max-jobs=1 the worker already waits, this is a safety net if a second worker is started.
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping('global-video-transcode'))
                ->releaseAfter(30)
                ->expireAfter(650),
        ];
    }

    public function __construct(
        public int $mediaId,
        public string $action = 'transcode',
        public array $options = [],
    ) {}

    public function handle(MediaRepository $repository): void
    {
        // 4GB VPS guard — cap PHP memory for ffmpeg wrapper (ffmpeg itself is external, but PHP wrappers leak via FFMpegFacade)
        ini_set('memory_limit', '512M');

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

            // Free FFMpeg handles and allow GC to reclaim ~300MB per transcode (4GB VPS)
            $media = null;
            gc_collect_cycles();
        } catch (\Throwable $e) {
            $repository->update($media, [
                'status' => ProcessingState::Failed->value,
                'failed_reason' => Str::limit($e->getMessage(), 4000),
                'processing_completed_at' => now(),
            ]);

            MediaProcessingFailed::dispatch($media, Str::limit($e->getMessage(), 4000));
            gc_collect_cycles();

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        logger()->error('Media processing job failed', [
            'media_id' => $this->mediaId,
            'action' => $this->action,
            'error' => Str::limit($e->getMessage(), 4000),
            'trace' => $e->getTraceAsString(),
        ]);
        gc_collect_cycles();
        $media = Media::find($this->mediaId);

        // Guard against double-dispatch: the catch block above already
        // transitioned the media to 'failed' for the normal error path.
        if ($media && $media->status !== ProcessingState::Failed->value) {
            $media->update([
                'status' => ProcessingState::Failed->value,
                'failed_reason' => Str::limit($e->getMessage(), 4000),
                'processing_completed_at' => now(),
            ]);

            MediaProcessingFailed::dispatch($media, Str::limit($e->getMessage(), 4000));
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

        $duration = $this->getSafeDuration($diskName, $media->path, $originalVideo);

        $metadata = [
            'width' => $originalVideo->getVideoStream()?->get('width'),
            'height' => $originalVideo->getVideoStream()?->get('height'),
            'duration' => $duration,
        ];

        $this->runTranscode($diskName, $media->path, $processedPath, $metadata['duration'] ?? 0, $this->options);

        $this->updateProgress($media, 80);

        $posterPath = $this->thumbnailsPath().'/'.pathinfo($processedFilename, PATHINFO_FILENAME).'.jpg';

        try {
            $this->generatePoster($diskName, $processedPath, $posterPath);
        } catch (\Throwable $e) {
            logger()->warning('Poster generation failed (non-fatal), falling back to original thumbnail', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);
            // Keep original thumbnail if poster fails (e.g., 2s video seeking to 2.00 EOF)
            $posterPath = $media->thumbnail ?? $posterPath;
        }

        $this->updateProgress($media, 90);

        $spriteImage = $this->spritesPath().'/'.pathinfo($processedFilename, PATHINFO_FILENAME).'.jpg';
        $spriteVtt = $this->spritesPath().'/'.pathinfo($processedFilename, PATHINFO_FILENAME).'.vtt';

        try {
            $this->generateSprite($diskName, $processedPath, $spriteImage, $spriteVtt, $metadata['duration'] ?? 0);
        } catch (\Throwable $e) {
            logger()->warning('Sprite generation failed (non-fatal)', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);
            $spriteImage = null;
            $spriteVtt = null;
        }

        $this->updateProgress($media, 95);

        $processedVideo = FFMpegFacade::fromDisk($diskName)
            ->open($processedPath);

        $processedDuration = $this->getSafeDuration($diskName, $processedPath, $processedVideo);

        $processed = [
            'width' => $processedVideo->getVideoStream()?->get('width'),
            'height' => $processedVideo->getVideoStream()?->get('height'),
            'duration' => $processedDuration,
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
        $crf = $options['crf'] ?? 24;
        // 4GB VPS: 'slow' OOMs on 720p+ watermark; use veryfast to keep single-job RAM <1.5GB
        $preset = $options['preset'] ?? 'veryfast';

        $storage = Storage::disk($disk);

        $inputPath = $storage->path($input);
        $outputPath = $storage->path($output);

        // Use Storage facade so directory is created as the app user (not just raw mkdir as queue user).
        // Falls back to mkdir with broader perms if the disk driver cannot create it.
        $outputDir = dirname($output);
        try {
            if (! $storage->exists($outputDir)) {
                $storage->makeDirectory($outputDir);
            }
        } catch (\Throwable) {
            if (! is_dir(dirname($outputPath)) && ! @mkdir(dirname($outputPath), 0775, true) && ! is_dir(dirname($outputPath))) {
                throw new \RuntimeException('Failed to create output directory: '.dirname($outputPath).' — check storage/app/public/media/processed ownership (should be writable by '.get_current_user().' / www-data).');
            }
        }

        // Ensure the directory is writable for the ffmpeg child process; attempt to fix common deploy drift (root-owned storage after rsync).
        if (! is_writable(dirname($outputPath))) {
            @chmod(dirname($outputPath), 0775);
            if (! is_writable(dirname($outputPath))) {
                throw new \RuntimeException('Output directory not writable: '.dirname($outputPath).' — run: sudo chown -R www-data:www-data storage/app/public/media && sudo chmod -R 775 storage/app/public/media');
            }
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
            '-threads',
            '1',
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

        try {
            $result = $process->wait();
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            if (str_contains($msg, 'signal "9"') || str_contains($msg, 'signal 9') || str_contains($msg, 'SIGKILL') || str_contains($msg, 'killed')) {
                throw new \RuntimeException(
                    'FFmpeg transcoding killed by OOM (signal 9). The video is too large for the current worker memory. Reduce source resolution/length or increase worker RAM/swap. Original: '.$e->getMessage(),
                    0,
                    $e
                );
            }
            throw $e;
        }

        if ($result->exitCode() !== 0) {
            $rawError = $result->errorOutput();
            $error = Str::limit($rawError, 3500);
            if (str_contains($rawError, 'Permission denied')) {
                $error .= ' — hint: sudo chown -R www-data:www-data storage/app/public/media && sudo chmod -R 775 storage/app/public/media && sudo -u www-data mkdir -p storage/app/public/media/processed';
            }
            if (str_contains($rawError, 'signal "9"') || str_contains($rawError, 'SIGKILL')) {
                $error = 'FFmpeg OOM (signal 9): '.$error;
            }
            throw new \RuntimeException(
                'FFmpeg transcoding failed: '.$error
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
        // For short videos (<2s), seeking to 2.00 is EOF → mjpeg encoder fails ("No filtered frames")
        // Try 1s or half-duration first, fallback to 0.5s
        $attempts = [1.0, 0.5, 0.0];
        $lastException = null;
        foreach ($attempts as $sec) {
            try {
                FFMpegFacade::fromDisk($disk)
                    ->open($video)
                    ->getFrameFromSeconds($sec)
                    ->export()
                    ->save($output);

                return;
            } catch (\Throwable $e) {
                $lastException = $e;
                // try next seek
            }
        }
        throw $lastException ?? new \RuntimeException('Poster generation failed after retries');
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

        $duration = $this->getSafeDuration($disk, $path, $ffmpeg);

        return [
            'width' => $ffmpeg->getVideoStream()?->get('width'),
            'height' => $ffmpeg->getVideoStream()?->get('height'),
            'duration' => $duration,
        ];
    }

    /**
     * Resolve duration without throwing UnknownDurationException.
     * Phone-recorded WebM (MediaRecorder) often has no container duration
     * — ffprobe reports N/A but the file is still playable and ffmpeg can transcode it.
     * We fall back through raw ffprobe probes so the job degrades (duration=0, no progress bar) instead of failing.
     */
    protected function getSafeDuration(string $diskName, string $path, $openedMedia = null): int
    {
        // Attempt 1: Laravel-FFMpeg wrapper (fast path)
        try {
            $media = $openedMedia ?? FFMpegFacade::fromDisk($diskName)->open($path);
            $sec = $media->getDurationInSeconds();

            if ($sec !== null && is_numeric($sec) && (float) $sec > 0) {
                return (int) round((float) $sec);
            }
        } catch (UnknownDurationException $e) {
            logger()->warning('Duration probe via LaravelFFMpeg failed, trying raw ffprobe', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
        } catch (\Throwable $e) {
            logger()->warning('Duration probe threw, trying raw ffprobe', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
        }

        $absolutePath = Storage::disk($diskName)->path($path);

        if (! file_exists($absolutePath)) {
            logger()->warning('Duration fallback: file not found', ['path' => $path, 'absolute' => $absolutePath]);

            return 0;
        }

        // Attempt 2: format duration (most reliable for mp4/mov, often N/A for phone webm)
        try {
            $result = Process::run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', $absolutePath]);

            if ($result->successful()) {
                $out = trim($result->output());

                if (is_numeric($out) && (float) $out > 0) {
                    return (int) round((float) $out);
                }
            }
        } catch (\Throwable) {
            // ignore
        }

        // Attempt 3: stream duration (sometimes present when format is not)
        try {
            $result = Process::run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'default=noprint_wrappers=1:nokey=1', $absolutePath]);

            if ($result->successful()) {
                $out = trim($result->output());

                if (is_numeric($out) && (float) $out > 0) {
                    return (int) round((float) $out);
                }
            }
        } catch (\Throwable) {
            // ignore
        }

        // Attempt 4: estimate via counted frames (handles truncated webm with no duration header)
        try {
            $result = Process::run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames,avg_frame_rate,r_frame_rate,duration', '-of', 'json', $absolutePath]);

            if ($result->successful()) {
                $json = json_decode($result->output(), true);
                $stream = $json['streams'][0] ?? null;

                if ($stream) {
                    if (isset($stream['duration']) && is_numeric($stream['duration']) && (float) $stream['duration'] > 0) {
                        return (int) round((float) $stream['duration']);
                    }

                    if (isset($stream['nb_read_frames']) && is_numeric($stream['nb_read_frames'])) {
                        $frames = (int) $stream['nb_read_frames'];
                        $rateStr = $stream['avg_frame_rate'] ?? $stream['r_frame_rate'] ?? null;

                        if ($rateStr && str_contains((string) $rateStr, '/')) {
                            [$num, $den] = explode('/', (string) $rateStr);
                            $fps = ((float) $den != 0) ? (float) $num / (float) $den : 0;

                            if ($fps > 0 && $frames > 0) {
                                return (int) round($frames / $fps);
                            }
                        }
                    }
                }
            }
        } catch (\Throwable) {
            // ignore
        }

        logger()->warning('Could not determine duration after all fallbacks, using 0 (transcode will continue without progress)', ['path' => $path]);

        return 0;
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
