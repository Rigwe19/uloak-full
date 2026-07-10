<?php

namespace App\Media\Enums;

enum ProcessingState: string
{
    case Uploading = 'uploading';
    case Processing = 'processing';
    case Ready = 'ready';
    case Failed = 'failed';
    case Deleted = 'deleted';

    public static function validTransitions(self $from, self $to): bool
    {
        return match ($from) {
            self::Uploading => in_array($to, [self::Processing, self::Failed], true),
            self::Processing => in_array($to, [self::Ready, self::Failed], true),
            self::Ready => $to === self::Deleted,
            self::Failed => $to === self::Deleted,
            self::Deleted => false,
        };
    }
}
