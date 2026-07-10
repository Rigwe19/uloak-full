<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $story_id
 * @property int|null $session_id
 * @property int|null $user_id
 * @property int $watch_time
 * @property bool $completed
 * @property string|null $device
 * @property string|null $browser
 * @property string|null $country
 * @property string|null $referrer
 * @property string|null $ip_hash
 * @property array|null $playback_events
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class MediaView extends Model
{
    protected $fillable = [
        'story_id',
        'session_id',
        'user_id',
        'watch_time',
        'completed',
        'device',
        'browser',
        'country',
        'referrer',
        'ip_hash',
        'playback_events',
    ];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'watch_time' => 'integer',
            'playback_events' => 'array',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }
}
