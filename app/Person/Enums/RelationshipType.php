<?php

namespace App\Person\Enums;

enum RelationshipType: string
{
    case IsChildOf = 'is_child_of';
    case IsParentOf = 'is_parent_of';
    case IsMarriedTo = 'is_married_to';
    case IsSiblingOf = 'is_sibling_of';
    case IsFormerSpouseOf = 'is_former_spouse_of';
    case IsGuardianOf = 'is_guardian_of';
    case IsFosterParentOf = 'is_foster_parent_of';
    case IsAdoptiveParentOf = 'is_adoptive_parent_of';
    case IsStepParentOf = 'is_step_parent_of';
    case IsFriendOf = 'is_friend_of';
    case IsSpiritualKinOf = 'is_spiritual_kin_of';
    case IsUnknown = 'is_unknown';

    public function label(): string
    {
        return match ($this) {
            self::IsChildOf => 'Child of',
            self::IsParentOf => 'Parent of',
            self::IsMarriedTo => 'Married to',
            self::IsSiblingOf => 'Sibling of',
            self::IsFormerSpouseOf => 'Former spouse of',
            self::IsGuardianOf => 'Guardian of',
            self::IsFosterParentOf => 'Foster parent of',
            self::IsAdoptiveParentOf => 'Adoptive parent of',
            self::IsStepParentOf => 'Step parent of',
            self::IsFriendOf => 'Friend of',
            self::IsSpiritualKinOf => 'Spiritual kin of',
            self::IsUnknown => 'Unknown',
        };
    }
}
