<?php

namespace App\Person\Enums;

enum LivingStatus: string
{
    case Living = 'living';
    case Deceased = 'deceased';
}
