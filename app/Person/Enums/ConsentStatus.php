<?php

namespace App\Person\Enums;

enum ConsentStatus: string
{
    case Granted = 'granted';
    case Withdrawn = 'withdrawn';
    case Pending = 'pending';
    case WithdrawnRequested = 'withdrawn_requested';
}
