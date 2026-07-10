<?php

namespace App\Person\Enums;

enum StatPeriod: string
{
    case Total = 'total';
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';
    case Year = 'year';
}
