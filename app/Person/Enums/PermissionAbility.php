<?php

namespace App\Person\Enums;

enum PermissionAbility: string
{
    case View = 'view';
    case Edit = 'edit';
    case Upload = 'upload';
    case Comment = 'comment';
    case Tag = 'tag';
    case Download = 'download';
    case Export = 'export';
    case Archive = 'archive';
    case Delete = 'delete';
}
