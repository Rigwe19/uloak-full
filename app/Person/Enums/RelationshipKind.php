<?php

namespace App\Person\Enums;

enum RelationshipKind: string
{
    case Biological = 'biological';
    case Adopted = 'adopted';
    case Step = 'step';
    case Guardian = 'guardian';
    case Foster = 'foster';
    case Marital = 'marital';
    case Spiritual = 'spiritual';
    case FamilyFriend = 'family_friend';
    case Unknown = 'unknown';
    case Disputed = 'disputed';
    case Suggested = 'suggested';
}
