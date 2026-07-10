<?php

namespace App\Person\Enums;

enum Visibility: string
{
    case Public = 'public';
    case Family = 'family';
    case Private = 'private';
    case Authenticated = 'authenticated';
}
