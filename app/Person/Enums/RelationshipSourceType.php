<?php

namespace App\Person\Enums;

enum RelationshipSourceType: string
{
    case Document = 'document';
    case Testimony = 'testimony';
    case Record = 'record';
    case Dna = 'dna';
    case Oral = 'oral';
    case Other = 'other';
}
