<?php

namespace App\Models;

use App\Enums\RoomStatus;
use App\Enums\RoomTier;
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
        'allow_download',
        'tier_type', 'storage_limit_bytes', 'expires_at', 'contributions_closed_at',
        'status', 'welcome_message', 'wedding_dates', 'referral_partner_id',
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
            'allow_download' => 'boolean',
            'tier_type' => RoomTier::class,
            'status' => RoomStatus::class,
            'expires_at' => 'datetime',
            'contributions_closed_at' => 'datetime',
            'wedding_dates' => 'array',
            'storage_used_bytes' => 'integer',
            'storage_limit_bytes' => 'integer',
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

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(Client::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function referralPartner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'referral_partner_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Billing & Limit Helpers
    |--------------------------------------------------------------------------
    |
    | Rooms with a null tier are legacy rooms created before monetization.
    | They remain unlimited and unaffected by tier limits.
    |
    */

    public function isLegacy(): bool
    {
        return $this->tier_type === null;
    }

    public function isActivePaidRoom(): bool
    {
        return $this->status === RoomStatus::Active;
    }

    /**
     * Remaining storage in bytes, or null for unlimited (legacy) rooms.
     */
    public function remainingStorageBytes(): ?int
    {
        if ($this->storage_limit_bytes === null) {
            return null;
        }

        return max(0, $this->storage_limit_bytes - $this->storage_used_bytes);
    }

    public function hasStorageRemaining(int $incomingBytes = 0): bool
    {
        $remaining = $this->remainingStorageBytes();

        return $remaining === null || $remaining >= $incomingBytes;
    }

    public function contributionsOpen(): bool
    {
        return $this->contributionBlockReason() === null;
    }

    public function contributionBlockReason(): ?string
    {
        if ($this->status === RoomStatus::Draft) {
            return 'draft';
        }

        if ($this->contributions_closed_at !== null) {
            return 'closed';
        }

        if ($this->expires_at !== null && $this->expires_at->isPast()) {
            return 'expired';
        }

        if (! $this->hasStorageRemaining(1)) {
            return 'storage_full';
        }

        return null;
    }

    public function addStorageBytes(int $bytes): void
    {
        if ($bytes <= 0) {
            return;
        }

        $this->increment('storage_used_bytes', $bytes);
    }

    public function removeStorageBytes(int $bytes): void
    {
        if ($bytes <= 0) {
            return;
        }

        $this->decrement('storage_used_bytes', min($bytes, $this->storage_used_bytes));
    }
}
