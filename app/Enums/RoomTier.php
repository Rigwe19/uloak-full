<?php

namespace App\Enums;

enum RoomTier: string
{
    case Starter = 'starter';
    case FullRoom = 'full_room';
    case FamilyArchive = 'family_archive';

    public function label(): string
    {
        return match ($this) {
            self::Starter => 'Starter Room',
            self::FullRoom => 'Full Ulo Room',
            self::FamilyArchive => 'Family Archive',
        };
    }

    public function storageLimitBytes(): int
    {
        return (int) config('pricing.tiers.'.$this->value.'.storage_bytes');
    }

    public function isPaid(): bool
    {
        return $this !== self::Starter;
    }
}
