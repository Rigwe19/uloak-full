<?php

namespace App\Enums;

enum SubscriptionTier: string
{
    case FamilyMonthly = 'family_monthly';
    case FamilyYearly = 'family_yearly';
    case ViewerMonthly = 'viewer_monthly';
    case ViewerYearly = 'viewer_yearly';
    case ViewerVipMonthly = 'viewer_vip_monthly';
    case ViewerVipYearly = 'viewer_vip_yearly';

    public function label(): string
    {
        return match ($this) {
            self::FamilyMonthly => 'Family Archive — Monthly',
            self::FamilyYearly => 'Family Archive — Yearly',
            self::ViewerMonthly => 'Viewer — Monthly',
            self::ViewerYearly => 'Viewer — Yearly',
            self::ViewerVipMonthly => 'Viewer VIP — Monthly',
            self::ViewerVipYearly => 'Viewer VIP — Yearly',
        };
    }

    public function interval(): string
    {
        return match ($this) {
            self::FamilyMonthly, self::ViewerMonthly, self::ViewerVipMonthly => 'month',
            self::FamilyYearly, self::ViewerYearly, self::ViewerVipYearly => 'year',
        };
    }

    public function priceKey(): string
    {
        return $this->value;
    }

    public function isViewer(): bool
    {
        return match ($this) {
            self::ViewerMonthly, self::ViewerYearly, self::ViewerVipMonthly, self::ViewerVipYearly => true,
            default => false,
        };
    }

    public function isVipViewer(): bool
    {
        return match ($this) {
            self::ViewerVipMonthly, self::ViewerVipYearly => true,
            default => false,
        };
    }
}
