<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DevicePushToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DevicePushTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:500'],
            'platform' => ['nullable', 'string', 'in:ios,android,web'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();

        $token = DevicePushToken::updateOrCreate(
            ['expo_push_token' => $validated['expo_push_token']],
            [
                'user_id' => $user->id,
                'platform' => $validated['platform'] ?? null,
                'device_name' => $validated['device_name'] ?? $request->header('User-Agent'),
                'last_seen_at' => now(),
            ]
        );

        return response()->json(['data' => $token], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:500'],
        ]);

        $request->user()->devicePushTokens()->where('expo_push_token', $validated['expo_push_token'])->delete();

        return response()->json(['message' => 'Push token removed.']);
    }
}
