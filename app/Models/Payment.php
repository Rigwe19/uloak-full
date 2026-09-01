<?php

namespace App\Models;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\Region;
use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int|null $room_id
 * @property string $provider_reference
 * @property PaymentStatus $status
 * @property int $amount
 * @property int|null $commission_amount
 * @property array|null $utm
 */
class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'room_id',
        'amount',
        'currency',
        'provider',
        'provider_reference',
        'idempotency_key',
        'status',
        'region',
        'partner_id',
        'commission_amount',
        'utm',
        'paid_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'commission_amount' => 'integer',
            'status' => PaymentStatus::class,
            'provider' => PaymentProvider::class,
            'region' => Region::class,
            'utm' => 'array',
            'paid_at' => 'datetime',
        ];
    }
}
