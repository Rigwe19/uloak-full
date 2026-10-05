<?php

namespace App\Enums;

enum RoomKind: string
{
    case Root = 'root';
    case Branch = 'branch';
    case Person = 'person';
    case Event = 'event';

    public function isStructural(): bool
    {
        return $this !== self::Event;
    }

    public function label(): string
    {
        return match ($this) {
            self::Root => 'Root',
            self::Branch => 'Branch',
            self::Person => 'Person',
            self::Event => 'Event',
        };
    }
}
