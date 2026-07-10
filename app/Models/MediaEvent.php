<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property-read int $id
 * @property string $event_name
 * @property int|null $eventable_id
 * @property string|null $eventable_type
 * @property int|null $story_id
 * @property int|null $room_id
 * @property int|null $user_id
 * @property string|null $media_type
 * @property string|null $device
 * @property string|null $browser
 * @property string|null $country
 * @property string|null $session_id
 * @property string|null $anonymous_id
 * @property string|null $ip_address
 * @property array|null $metadata
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class MediaEvent extends Model
{
    protected $fillable = [
        'event_name',
        'eventable_id',
        'eventable_type',
        'story_id',
        'room_id',
        'user_id',
        'media_type',
        'device',
        'browser',
        'country',
        'session_id',
        'anonymous_id',
        'ip_address',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'ip_address' => 'string',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function eventable(): MorphTo
    {
        return $this->morphTo();
    }
}
