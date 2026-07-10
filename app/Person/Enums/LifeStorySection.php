<?php

namespace App\Person\Enums;

enum LifeStorySection: string
{
    case Summary = 'summary';
    case Childhood = 'childhood';
    case Education = 'education';
    case Career = 'career';
    case Migration = 'migration';
    case Faith = 'faith';
    case Community = 'community';
    case Achievements = 'achievements';
    case Lessons = 'lessons';
    case Quotes = 'quotes';
    case KnownFor = 'known_for';
    case Personality = 'personality';
    case Skills = 'skills';
    case Hobbies = 'hobbies';
    case Values = 'values';
    case Legacy = 'legacy';
}
