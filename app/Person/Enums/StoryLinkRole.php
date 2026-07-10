<?php

namespace App\Person\Enums;

enum StoryLinkRole: string
{
    case Subject = 'subject';
    case Author = 'author';
    case Mentioned = 'mentioned';
    case Contributor = 'contributor';
}
