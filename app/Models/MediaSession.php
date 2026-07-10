<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read int $id
 * @property string $session_id
 * @property int|null $user_id
 * @property string|null $anonymous_id
 * @property string|null $ip_hash
 * @property array|null $user_agent
 * @property CarbonImmutable|null $started_at
 * @property CarbonImmutable|null $last_activity_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class MediaSession extends Model
{
    protected $fillable = [
        'session_id',
        'user_id',
        'anonymous_id',
        'ip_hash',
        'user_agent',
        'started_at',
        'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'user_agent' => 'array',
            'started_at' => 'immutable_datetime',
            'last_activity_at' => 'immutable_datetime',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }
}
