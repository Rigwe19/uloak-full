<?php

namespace App\Person\Enums;

enum StatMetric: string
{
    case Views = 'views';
    case Stories = 'stories';
    case Photos = 'photos';
    case Videos = 'videos';
    case Contributions = 'contributions';
    case Engagement = 'engagement';
    case TimelineCompleteness = 'timeline_completeness';
    case RelationshipCompleteness = 'relationship_completeness';
    case MediaCompleteness = 'media_completeness';
    case FamilyTreeCompleteness = 'family_tree_completeness';
}
