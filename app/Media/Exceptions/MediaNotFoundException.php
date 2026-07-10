<?php

namespace App\Media\Exceptions;

use Exception;

class MediaNotFoundException extends Exception
{
    public function __construct(
        int|string $identifier,
        string $message = '',
        int $code = 404,
        ?Throwable $previous = null,
    ) {
        $message = $message ?: sprintf('Media with identifier "%s" was not found.', $identifier);

        parent::__construct($message, $code, $previous);
    }
}
