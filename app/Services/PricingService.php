<?php

namespace App\Services;

use App\Enums\Region;
use App\Enums\RoomTier;
use Illuminate\Http\Request;

class PricingService
{
    public function resolveRegion(?string $value): Region
    {
        if ($value === null || $value === '') {
            return Region::default();
        }

        return Region::tryFrom($value) ?? Region::default();
    }

    public function detectRegion(Request $request): Region
    {
        // 1. Explicit user selection stored in session.
        $selected = $request->session()->get('pricing_region');
        if ($selected !== null && Region::tryFrom($selected) !== null) {
            return Region::from($selected);
        }

        // 2. Cloudflare IP country header (set when behind Cloudflare).
        $cfCountry = $request->header('CF-IPCountry');
        if (is_string($cfCountry) && $cfCountry !== '' && $cfCountry !== 'XX') {
            foreach (Region::cases() as $region) {
                if (in_array(strtoupper($cfCountry), array_map('strtoupper', $region->geoCountries()), true)) {
                    return $region;
                }
            }
        }

        return Region::default();
    }

    public function priceFor(Region $region, string $key): int
    {
        return (int) config('pricing.regions.'.$region->value.'.'.$key);
    }

    /**
     * Server-side price resolution for a checkout. Never trust client amounts.
     *
     * @return array{amount: int, currency: string}
     */
    public function checkoutPrice(Region $region, string $tierKey): array
    {
        $configKey = match ($tierKey) {
            RoomTier::Starter->value => null, // free — no payment
            RoomTier::FullRoom->value => 'full_room',
            'family_monthly' => 'family_monthly',
            'family_yearly' => 'family_yearly',
            default => throw new \InvalidArgumentException("Unknown tier key: {$tierKey}"),
        };

        if ($configKey === null) {
            return ['amount' => 0, 'currency' => $region->currency()];
        }

        return [
            'amount' => $this->priceFor($region, $configKey),
            'currency' => $region->currency(),
        ];
    }

    public function formatAmount(int $amountMinor, string $currency): string
    {
        $amount = $amountMinor / 100;

        $symbol = match ($currency) {
            'NGN' => '₦',
            'GBP' => '£',
            'EUR' => '€',
            default => '$',
        };

        return $symbol.number_format($amount, $amountMinor % 100 === 0 ? 0 : 2);
    }

    /**
     * All regions with display-ready pricing for a pricing page.
     *
     * @return array<string, array<string, mixed>>
     */
    public function allRegionPricing(): array
    {
        $out = [];

        foreach (config('pricing.regions') as $key => $region) {
            $out[$key] = [
                'key' => $key,
                'label' => $region['label'],
                'currency' => $region['currency'],
                'full_room' => $region['full_room'],
                'full_room_formatted' => $this->formatAmount($region['full_room'], $region['currency']),
                'family_monthly' => $region['family_monthly'],
                'family_monthly_formatted' => $this->formatAmount($region['family_monthly'], $region['currency']),
                'family_yearly' => $region['family_yearly'],
                'family_yearly_formatted' => $this->formatAmount($region['family_yearly'], $region['currency']),
                'yearly_savings' => $region['yearly_savings'],
                'yearly_savings_formatted' => $this->formatAmount($region['yearly_savings'], $region['currency']),
            ];
        }

        return $out;
    }

    public function tierLimits(RoomTier $tier): array
    {
        return config('pricing.tiers.'.$tier->value, []);
    }
}
