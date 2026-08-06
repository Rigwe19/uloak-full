<?php

namespace App\Models;

use App\Media\MediaManager;
use Carbon\CarbonImmutable;
use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read int $id
 * @property-read string $uuid
 * @property string $filename
 * @property string $original_name
 * @property string $mime_type
 * @property string|null $extension
 * @property int|null $width
 * @property int|null $height
 * @property int $size
 * @property string $disk
 * @property string $path
 * @property string $type
 * @property string|null $checksum
 * @property string|null $status
 * @property string $provider
 * @property string|null $provider_id
 * @property string|null $thumbnail
 * @property string|null $preview
 * @property array|null $sprite
 * @property float|null $duration
 * @property float|null $aspect_ratio
 * @property string|null $failed_reason
 * @property int $retry_count
 * @property CarbonImmutable|null $processing_started_at
 * @property CarbonImmutable|null $processing_completed_at
 * @property array|null $metadata
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory;

    protected $fillable = [
        'uuid',
        'filename',
        'original_name',
        'mime_type',
        'extension',
        'width',
        'height',
        'size',
        'disk',
        'path',
        'type',
        'checksum',
        'status',
        'provider',
        'provider_id',
        'thumbnail',
        'preview',
        'sprite',
        'duration',
        'aspect_ratio',
        'failed_reason',
        'retry_count',
        'eager',
        'eager_response',
        'processing_started_at',
        'processing_completed_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'width' => 'integer',
            'height' => 'integer',
            'size' => 'integer',
            'metadata' => 'array',
            'sprite' => 'array',
            'duration' => 'float',
            'aspect_ratio' => 'float',
            'retry_count' => 'integer',
            'eager' => 'boolean',
            'eager_response' => 'array',
            'processing_started_at' => 'immutable_datetime',
            'processing_completed_at' => 'immutable_datetime',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function url(): string
    {
        return app(MediaManager::class)->forMedia($this)->url();
    }

    public function thumbnail(?int $width = 300, ?int $height = 300, array $options = []): string
    {
        return app(MediaManager::class)->forMedia($this)->thumbnail($width, $height, $options);
    }

    public function resize(int $width, int $height, array $options = []): string
    {
        return app(MediaManager::class)
            ->forMedia($this)
            ->width($width)
            ->height($height)
            ->quality($options['quality'] ?? 80)
            ->process();
    }

    public function isImage(): bool
    {
        return $this->type === 'image';
    }

    public function isVideo(): bool
    {
        return $this->type === 'video';
    }

    public function isReady(): bool
    {
        return $this->status === 'ready';
    }

    public function isProcessing(): bool
    {
        return in_array($this->status, ['uploading', 'processing'], true);
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
