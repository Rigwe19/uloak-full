<?php

namespace App\Models;

use App\Enums\CreatorType;
use Database\Factories\CreatorProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property-read int $id
 * @property int $user_id
 * @property CreatorType $creator_type
 * @property string $ref_code
 * @property float|null $commission_rate
 * @property bool $is_approved_vip
 */
class CreatorProfile extends Model
{
    /** @use HasFactory<CreatorProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'creator_type',
        'ref_code',
        'commission_rate',
        'is_approved_vip',
        'payout_details',
    ];

    protected static function booted(): void
    {
        static::creating(function (CreatorProfile $profile) {
            if (empty($profile->ref_code)) {
                $profile->ref_code = strtoupper(Str::random(8));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(CreatorEarning::class);
    }

    /**
     * Effective revenue split percent for this creator. A per-creator
     * commission_rate overrides the global normal/vip default.
     */
    public function splitPct(): float
    {
        if ($this->commission_rate !== null) {
            return (float) $this->commission_rate;
        }

        return $this->creator_type->splitPct();
    }

    public function calculateEarning(int $amountMinor): int
    {
        return (int) round($amountMinor * ($this->splitPct() / 100));
    }

    public function isVip(): bool
    {
        return $this->creator_type === CreatorType::Vip && $this->is_approved_vip;
    }

    protected function casts(): array
    {
        return [
            'creator_type' => CreatorType::class,
            'commission_rate' => 'float',
            'is_approved_vip' => 'boolean',
            'payout_details' => 'array',
        ];
    }
}
