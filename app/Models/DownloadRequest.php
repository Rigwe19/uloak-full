<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class DownloadRequest extends Model
{
    protected $fillable = [
        'room_id', 'event_id', 'email', 'zip_path', 'token',
        'expires_at', 'downloaded_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'downloaded_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $request) {
            $request->token = Str::random(64);
        });
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now())
            ->whereNull('downloaded_at');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
