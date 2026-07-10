<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    protected ?Request $request;

    public function __construct(?Request $request = null)
    {
        $this->request = $request;
    }

    public function log(string $description, ?string $subjectType = null, ?string $subjectId = null, array $properties = []): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'description' => $description,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'properties' => $properties,
            'ip_address' => $this->request?->ip(),
            'user_agent' => $this->request?->userAgent(),
        ]);
    }

    public function logForGuest(string $description, array $guestData = [], ?string $subjectType = null, ?string $subjectId = null): void
    {
        ActivityLog::create([
            'user_id' => null,
            'description' => $description,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'properties' => array_merge($guestData, [
                'source' => 'guest',
            ]),
            'ip_address' => $this->request?->ip(),
            'user_agent' => $this->request?->userAgent(),
        ]);
    }
}
