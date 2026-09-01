<?php

namespace App\Models;

use App\Enums\PaymentProvider;
use App\Enums\Region;
use App\Enums\SubscriptionStatus;
use App\Enums\SubscriptionTier;
use Carbon\CarbonImmutable;
use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property SubscriptionTier $tier
 * @property SubscriptionStatus $status
 * @property CarbonImmutable $current_period_start
 * @property CarbonImmutable $current_period_end
 * @property bool $cancel_at_period_end
 */
class Subscription extends Model
{
    /** @use HasFactory<SubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tier',
        'status',
        'current_period_start',
        'current_period_end',
        'cancel_at_period_end',
        'provider',
        'provider_reference',
        'provider_customer_reference',
        'region',
        'currency',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'tier' => SubscriptionTier::class,
            'status' => SubscriptionStatus::class,
            'provider' => PaymentProvider::class,
            'region' => Region::class,
            'current_period_start' => 'immutable_datetime',
            'current_period_end' => 'immutable_datetime',
            'cancel_at_period_end' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', SubscriptionStatus::Active->value);
    }

    public function isActive(): bool
    {
        return $this->status === SubscriptionStatus::Active
            && $this->current_period_end->isFuture();
    }
}
