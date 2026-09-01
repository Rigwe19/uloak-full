<?php

namespace App\Enums;

enum SubscriptionTier: string
{
    case FamilyMonthly = 'family_monthly';
    case FamilyYearly = 'family_yearly';

    public function label(): string
    {
        return match ($this) {
            self::FamilyMonthly => 'Family Archive — Monthly',
            self::FamilyYearly => 'Family Archive — Yearly',
        };
    }

    public function interval(): string
    {
        return $this === self::FamilyMonthly ? 'month' : 'year';
    }

    public function priceKey(): string
    {
        return $this === self::FamilyMonthly ? 'family_monthly' : 'family_yearly';
    }
}
