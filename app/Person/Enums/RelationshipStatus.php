<?php

namespace App\Person\Enums;

enum RelationshipStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Unverified = 'unverified';
    case Disputed = 'disputed';
}
