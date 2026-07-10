<?php

namespace App\Media;

use App\Media\Contracts\ImageProcessor;
use App\Media\Contracts\VideoProcessor;
use App\Media\Enums\MediaType;
use App\Media\Exceptions\MediaProcessingException;
use App\Media\Repositories\MediaRepository;
use App\Media\Storage\StorageManager;
use App\Models\Media;
use Illuminate\Http\UploadedFile;

class MediaManager
{
    protected const RESOLUTIONS = [
        '360p' => [640, 360],
        '480p' => [854, 480],
        '720p' => [1280, 720],
        '1080p' => [1920, 1080],
        '1440p' => [2560, 1440],
        '4k' => [3840, 2160],
    ];

    protected ?Media $media = null;

    protected ?ImageProcessor $imageProcessor = null;

    protected ?VideoProcessor $videoProcessor = null;

    protected array $operations = [];

    protected ?int $width = null;

    protected ?int $height = null;

    protected ?string $resolutionLabel = null;

    protected ?int $quality = null;

    protected ?string $format = null;

    protected string $mode = 'resize';

    public function __construct(
        protected MediaRepository $repository,
        protected StorageManager $storage,
        protected ImageProcessor $defaultImageProcessor,
        protected VideoProcessor $defaultVideoProcessor,
    ) {}

    public static function image(int|string $id): static
    {
        $instance = app(static::class);

        return $instance->forImage($id);
    }

    public static function video(int|string $id): static
    {
        $instance = app(static::class);

        return $instance->forVideo($id);
    }

    public function forMedia(Media $media): static
    {
        $this->media = $media;

        if ($media->type === MediaType::Image->value) {
            $this->imageProcessor = $this->defaultImageProcessor;
        } else {
            $this->videoProcessor = $this->defaultVideoProcessor;
        }

        return $this;
    }

    public function forImage(int|string $id): static
    {
        $this->media = $this->repository->findByIdOrUuid($id);

        if ($this->media->type !== MediaType::Image->value) {
            throw new MediaProcessingException("Media [{$id}] is not an image.");
        }

        $this->imageProcessor = $this->defaultImageProcessor;

        return $this;
    }

    public function forVideo(int|string $id): static
    {
        $this->media = $this->repository->findByIdOrUuid($id);

        if ($this->media->type !== MediaType::Video->value) {
            throw new MediaProcessingException("Media [{$id}] is not a video.");
        }

        $this->videoProcessor = $this->defaultVideoProcessor;

        return $this;
    }

    public function width(int $width): static
    {
        $this->width = $width;

        return $this;
    }

    public function height(int $height): static
    {
        $this->height = $height;

        return $this;
    }

    public function quality(int $quality): static
    {
        $this->quality = $quality;

        return $this;
    }

    public function format(string $format): static
    {
        $this->format = $format;

        return $this;
    }

    public function fit(): static
    {
        $this->mode = 'fit';

        return $this;
    }

    public function crop(): static
    {
        $this->mode = 'fit';

        return $this;
    }

    public function contain(): static
    {
        $this->mode = 'contain';

        return $this;
    }

    public function resolution(string $label): static
    {
        $this->resolutionLabel = $label;

        if (isset(self::RESOLUTIONS[$label])) {
            [$this->width, $this->height] = self::RESOLUTIONS[$label];
        }

        return $this;
    }

    public function url(): string
    {
        if ($this->media === null) {
            throw new MediaProcessingException('No media loaded. Call image() or video() first.');
        }

        return $this->storage->mediaUrl($this->media);
    }

    public function thumbnail(?int $width = null, ?int $height = null, array $options = []): string
    {
        if ($this->media === null) {
            throw new MediaProcessingException('No media loaded. Call image() or video() first.');
        }

        if ($this->media->type === MediaType::Image->value) {
            return $this->imageProcessor->process($this->media, array_merge([
                'width' => $width ?? 300,
                'height' => $height ?? 300,
                'mode' => 'fit',
                'quality' => $this->quality ?? 80,
                'format' => $this->format ?? 'webp',
            ], $options));
        }

        $videoProcessor = $this->videoProcessor ?? $this->defaultVideoProcessor;

        $processed = $videoProcessor->thumbnail($this->media, array_merge([
            'width' => $width,
            'height' => $height,
        ], $options));

        $thumbnailPath = $processed->metadata['thumbnail_path'] ?? null;

        if ($thumbnailPath) {
            return $this->storage->url($thumbnailPath, $processed->metadata['thumbnail_disk'] ?? $processed->disk);
        }

        return $this->storage->mediaUrl($this->media);
    }

    public function process(): string
    {
        if ($this->media === null) {
            throw new MediaProcessingException('No media loaded. Call image() or video() first.');
        }

        return $this->imageProcessor->process($this->media, [
            'width' => $this->width,
            'height' => $this->height,
            'mode' => $this->mode,
            'quality' => $this->quality ?? 80,
            'format' => $this->format ?? 'webp',
        ]);
    }

    public function serve(): array
    {
        if ($this->media === null) {
            throw new MediaProcessingException('No media loaded. Call image() first.');
        }

        $format = $this->format ?? 'webp';
        $mimeType = match ($format) {
            'webp' => 'image/webp',
            'jpeg', 'jpg' => 'image/jpeg',
            'png' => 'image/png',
            default => 'image/webp',
        };

        $content = $this->imageProcessor->processStream($this->media, [
            'width' => $this->width,
            'height' => $this->height,
            'mode' => $this->mode,
            'quality' => $this->quality ?? 80,
            'format' => $format,
        ]);

        return [$content, $mimeType];
    }

    public function serveThumbnail(?int $width = 300, ?int $height = 300): array
    {
        return $this->width($width)
            ->height($height)
            ->fit()
            ->serve();
    }

    public function uploadImage(UploadedFile $file): Media
    {
        return $this->defaultImageProcessor->upload($file);
    }

    public function uploadVideo(UploadedFile $file): Media
    {
        return $this->defaultVideoProcessor->upload($file);
    }

    public function uploadAudio(UploadedFile $file): Media
    {
        $path = $this->storage->store($file, config('media.image.paths.originals', 'media/originals'));
        $checksum = md5_file($file->getRealPath());

        return $this->repository->createFromUpload(
            file: $file,
            path: $path,
            disk: config('media.storage.disk', 'public'),
            type: MediaType::Audio,
            checksum: $checksum,
        );
    }

    public function compress(): Media
    {
        if ($this->media === null) {
            throw new MediaProcessingException('No media loaded. Call video() first.');
        }

        $options = [];

        if ($this->resolutionLabel !== null) {
            $options['resolution'] = $this->resolutionLabel;

            if (isset(self::RESOLUTIONS[$this->resolutionLabel])) {
                [$options['width'], $options['height']] = self::RESOLUTIONS[$this->resolutionLabel];
            }
        }

        return $this->videoProcessor->compress($this->media, $options);
    }

    public function optimize(): Media
    {
        if ($this->media === null) {
            throw new MediaProcessingException('No media loaded. Call video() first.');
        }

        return $this->videoProcessor->optimize($this->media);
    }

    public function delete(): bool
    {
        if ($this->media === null) {
            throw new MediaProcessingException('No media loaded.');
        }

        $this->storage->deleteMedia($this->media);

        return $this->repository->delete($this->media);
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function setImageProcessor(ImageProcessor $processor): static
    {
        $this->imageProcessor = $processor;

        return $this;
    }

    public function setVideoProcessor(VideoProcessor $processor): static
    {
        $this->videoProcessor = $processor;

        return $this;
    }
}
