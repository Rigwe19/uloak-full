<?php

namespace App\Models;

use Database\Factories\PartnerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read int $id
 * @property string $ref_code
 * @property float $commission_rate
 * @property bool $is_active
 */
class Partner extends Model
{
    /** @use HasFactory<PartnerFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'contact_email',
        'ref_code',
        'commission_rate',
        'is_active',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'referral_partner_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Commission owed for a payment amount stored in minor units. For NGN the
     * launch floor is ₦3,000, capped so it can never exceed the payment itself.
     */
    public function calculateCommission(int $amountMinor, string $currency): int
    {
        $commission = (int) round($amountMinor * ($this->commission_rate / 100));

        if ($currency === 'NGN') {
            $floor = (int) config('pricing.partner.ngn_min_commission');

            $commission = max($commission, min($floor, $amountMinor));
        }

        return $commission;
    }

    protected function casts(): array
    {
        return [
            'commission_rate' => 'float',
            'is_active' => 'boolean',
        ];
    }
}
