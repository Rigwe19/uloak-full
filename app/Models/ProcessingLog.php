<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read int $id
 * @property int|null $media_id
 * @property string|null $media_uuid
 * @property string|null $from_state
 * @property string $to_state
 * @property int|null $duration_ms
 * @property string|null $exception
 * @property int $retry_count
 * @property string|null $cloudinary_public_id
 * @property array|null $metadata
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class ProcessingLog extends Model
{
    protected $fillable = [
        'media_id',
        'media_uuid',
        'from_state',
        'to_state',
        'duration_ms',
        'exception',
        'retry_count',
        'cloudinary_public_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'duration_ms' => 'integer',
            'retry_count' => 'integer',
            'metadata' => 'array',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }
}
