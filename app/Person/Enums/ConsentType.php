<?php

namespace App\Person\Enums;

enum ConsentType: string
{
    case ProfileVisibility = 'profile_visibility';
    case MediaVisibility = 'media_visibility';
    case RelationshipPrivacy = 'relationship_privacy';
    case SensitiveInfo = 'sensitive_info';
    case MinorConsent = 'minor_consent';
    case GuardianApproval = 'guardian_approval';
    case Withdrawal = 'withdrawal';
}
