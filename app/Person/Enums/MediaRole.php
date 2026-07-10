<?php

namespace App\Person\Enums;

enum MediaRole: string
{
    case ProfilePhoto = 'profile_photo';
    case Featured = 'featured';
    case Archive = 'archive';
    case Timeline = 'timeline';
    case Handwriting = 'handwriting';
    case Voice = 'voice';
    case Document = 'document';
    case LegacyCollection = 'legacy_collection';
}
