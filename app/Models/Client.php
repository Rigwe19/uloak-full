<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Client extends Model
{
    protected $fillable = [
        'business_user_id', 'name', 'email', 'phone', 'company',
        'notes', 'access_token',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $client) {
            $client->access_token = Str::random(64);
        });
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(User::class, 'business_user_id');
    }

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class);
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class);
    }

    public function getAccessUrlAttribute(): string
    {
        return route('client.access', $this->access_token);
    }

    public function regenerateToken(): void
    {
        $this->access_token = Str::random(64);
        $this->save();
    }
}
