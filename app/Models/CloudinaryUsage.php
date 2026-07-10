<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read int $id
 * @property string $date
 * @property int $storage_bytes
 * @property int $bandwidth_bytes
 * @property int $transformations
 * @property int $derived_assets
 * @property int $preview_clips
 * @property int $sprite_sheets
 * @property int $watermarked_videos
 * @property int $credits_used
 * @property int|null $credits_remaining
 * @property array|null $raw_api_response
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class CloudinaryUsage extends Model
{
    protected $fillable = [
        'date',
        'storage_bytes',
        'bandwidth_bytes',
        'transformations',
        'derived_assets',
        'preview_clips',
        'sprite_sheets',
        'watermarked_videos',
        'credits_used',
        'credits_remaining',
        'raw_api_response',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'storage_bytes' => 'integer',
            'bandwidth_bytes' => 'integer',
            'transformations' => 'integer',
            'derived_assets' => 'integer',
            'preview_clips' => 'integer',
            'sprite_sheets' => 'integer',
            'watermarked_videos' => 'integer',
            'credits_used' => 'integer',
            'credits_remaining' => 'integer',
            'raw_api_response' => 'array',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }
}
