<?php

namespace App\Media\Exceptions;

use Exception;

class UnsupportedFormatException extends Exception
{
    public function __construct(
        public readonly string $mimeType,
        public readonly string $driver,
        string $message = '',
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        $message = $message ?: sprintf(
            'The format "%s" is not supported by the "%s" processor.',
            $mimeType,
            $driver,
        );

        parent::__construct($message, $code, $previous);
    }
}
