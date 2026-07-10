<?php

namespace App\Person\Enums;

enum LanguageProficiency: string
{
    case Native = 'native';
    case Fluent = 'fluent';
    case Conversational = 'conversational';
    case Basic = 'basic';
}
