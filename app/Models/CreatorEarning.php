<?php

namespace App\Models;

use Database\Factories\CreatorEarningFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $amount_minor
 * @property string $status
 */
class CreatorEarning extends Model
{
    /** @use HasFactory<CreatorEarningFactory> */
    use HasFactory;

    protected $fillable = [
        'creator_profile_id',
        'payment_id',
        'subscription_id',
        'viewer_user_id',
        'amount_minor',
        'currency',
        'split_pct',
        'status',
        'paid_at',
    ];

    public function creatorProfile(): BelongsTo
    {
        return $this->belongsTo(CreatorProfile::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function viewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'viewer_user_id');
    }

    protected function casts(): array
    {
        return [
            'amount_minor' => 'integer',
            'split_pct' => 'float',
            'paid_at' => 'datetime',
        ];
    }
}
