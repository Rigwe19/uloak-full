<?php

namespace App\Person\Enums;

enum PersonType: string
{
    case ActiveUser = 'active_user';
    case InvitedUser = 'invited_user';
    case Child = 'child';
    case Deceased = 'deceased';
    case Memorial = 'memorial';
    case Guest = 'guest';
    case HistoricalFigure = 'historical_figure';
    case FamilyMember = 'family_member';
    case Administrator = 'administrator';
    case Contributor = 'contributor';
}
