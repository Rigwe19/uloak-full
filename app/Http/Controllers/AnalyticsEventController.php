<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyticsEventController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event' => ['required', 'string', 'max:64'],
            'properties' => ['nullable', 'array'],
        ]);

        Log::info('analytics.event', [
            'event' => $validated['event'],
            'properties' => $validated['properties'] ?? [],
            'ip' => $request->ip(),
            'user_id' => $request->user()?->id,
            'ref' => $request->session()->get('referral_code') ?? $request->cookie('ulo_ref'),
            'utm' => $request->session()->get('utm', []),
        ]);

        return response()->json(['ok' => true]);
    }
}
