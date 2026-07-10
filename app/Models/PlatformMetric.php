<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read int $id
 * @property string $date
 * @property int $new_users
 * @property int $total_users
 * @property int $uploads
 * @property int $views
 * @property int $unique_viewers
 * @property int $watch_time_seconds
 * @property int $active_rooms
 * @property int $new_rooms
 * @property int $processing_jobs
 * @property int $failed_jobs
 * @property int $storage_bytes
 * @property int $bandwidth_bytes
 * @property int $comments
 * @property int $likes
 * @property float $avg_processing_time_ms
 * @property array|null $extra
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PlatformMetric extends Model
{
    protected $fillable = [
        'date',
        'new_users',
        'total_users',
        'uploads',
        'views',
        'unique_viewers',
        'watch_time_seconds',
        'active_rooms',
        'new_rooms',
        'processing_jobs',
        'failed_jobs',
        'storage_bytes',
        'bandwidth_bytes',
        'comments',
        'likes',
        'avg_processing_time_ms',
        'extra',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'new_users' => 'integer',
            'total_users' => 'integer',
            'uploads' => 'integer',
            'views' => 'integer',
            'unique_viewers' => 'integer',
            'watch_time_seconds' => 'integer',
            'active_rooms' => 'integer',
            'new_rooms' => 'integer',
            'processing_jobs' => 'integer',
            'failed_jobs' => 'integer',
            'storage_bytes' => 'integer',
            'bandwidth_bytes' => 'integer',
            'comments' => 'integer',
            'likes' => 'integer',
            'avg_processing_time_ms' => 'float',
            'extra' => 'array',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }
}
