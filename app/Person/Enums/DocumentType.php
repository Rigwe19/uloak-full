<?php

namespace App\Person\Enums;

enum DocumentType: string
{
    case BirthCert = 'birth_cert';
    case DeathCert = 'death_cert';
    case Will = 'will';
    case Passport = 'passport';
    case IdCard = 'id_card';
    case Other = 'other';
}
