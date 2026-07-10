<?php

namespace App\Person\Enums;

enum TimelineEventType: string
{
    case Birth = 'birth';
    case School = 'school';
    case Marriage = 'marriage';
    case Migration = 'migration';
    case Career = 'career';
    case Award = 'award';
    case Child = 'child';
    case Retirement = 'retirement';
    case Death = 'death';
    case FamilyEvent = 'family_event';
    case Custom = 'custom';
}
