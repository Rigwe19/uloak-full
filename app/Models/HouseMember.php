<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class HouseMember extends Model
{
    protected $fillable = [
        'owner_id', 'name', 'email', 'access_token', 'avatar', 'bio', 'position', 'preferences',
    ];

    protected $hidden = [
        'access_token',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $member) {
            $member->access_token = Str::random(64);
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function createdRooms(): HasMany
    {
        return $this->hasMany(Room::class, 'created_by_house_member_id');
    }

    public function regenerateToken(): void
    {
        $this->access_token = Str::random(64);
        $this->save();
    }
}
