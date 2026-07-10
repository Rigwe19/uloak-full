<?php

namespace App\Person\Enums;

enum GranteeType: string
{
    case User = 'user';
    case Role = 'role';
    case Public = 'public';
    case Family = 'family';
}
