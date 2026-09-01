<?php

namespace App\Enums;

enum RoomStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Expired = 'expired';
    case Archived = 'archived';
}
