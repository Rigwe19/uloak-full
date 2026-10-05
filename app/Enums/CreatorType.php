<?php

namespace App\Enums;

enum CreatorType: string
{
    case Normal = 'normal';
    case Vip = 'vip';

    public function splitPct(): float
    {
        return match ($this) {
            self::Normal => (float) config('pricing.creator.normal_split_pct', 70.0),
            self::Vip => (float) config('pricing.creator.vip_split_pct', 80.0),
        };
    }
}
