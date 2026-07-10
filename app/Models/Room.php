<?php

namespace App\Models;

use Database\Factories\RoomFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Room extends Model
{
    /** @use HasFactory<RoomFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'thumbnail', 'description', 'privacy', 'created_by',
        'created_by_house_member_id',
        'room_type', 'enable_tributes', 'enable_condolence_attendance', 'enable_candle_lighting',
        'tribute_song', 'media_items', 'tribute_name',
        'start_date',
        'end_date',
    ];

    protected static function booted(): void
    {
        static::creating(function ($room) {
            if (empty($room->slug)) {
                $room->slug = Str::slug($room->name).'-'.Str::random(6);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function createdByHouseMember(): BelongsTo
    {
        return $this->belongsTo(HouseMember::class, 'created_by_house_member_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    protected function casts(): array
    {
        return [
            'enable_tributes' => 'boolean',
            'enable_condolence_attendance' => 'boolean',
            'enable_candle_lighting' => 'boolean',
            'media_items' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function tributes(): HasMany
    {
        return $this->hasMany(Tribute::class);
    }

    public function approvedTributes(): HasMany
    {
        return $this->hasMany(Tribute::class)->where('is_approved', true);
    }

    public function candles(): HasMany
    {
        return $this->hasMany(Candle::class);
    }

    public function guestSubscriptions(): HasMany
    {
        return $this->hasMany(RoomGuestSubscription::class);
    }

    public function familyMembers(): HasMany
    {
        return $this->hasMany(RoomMember::class);
    }
}
