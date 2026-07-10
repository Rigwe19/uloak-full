<?php

namespace App\Person\Enums;

enum MilestoneCategory: string
{
    case Award = 'award';
    case Achievement = 'achievement';
    case Education = 'education';
    case Career = 'career';
    case Migration = 'migration';
    case Birth = 'birth';
    case Death = 'death';
    case Marriage = 'marriage';
    case Other = 'other';
}
