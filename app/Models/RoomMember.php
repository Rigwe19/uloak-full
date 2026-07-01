<?php

namespace App\Models;

use Database\Factories\RoomMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RoomMember extends Model
{
    /** @use HasFactory<RoomMemberFactory> */
    use HasFactory;

    protected $fillable = [
        'room_id',
        'email',
        'name',
        'relationship',
        'access_token',
    ];

    protected static function booted(): void
    {
        static::creating(function (RoomMember $member) {
            if (empty($member->access_token)) {
                $member->access_token = Str::random(64);
            }
        });
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function regenerateToken(): void
    {
        $this->access_token = Str::random(64);
        $this->save();
    }
}
