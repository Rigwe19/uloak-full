<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class ExpoPushService
{
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->devicePushTokens()->pluck('expo_push_token')->all();
        if (empty($tokens)) {
            return;
        }

        $messages = collect($tokens)->map(fn ($token) => [
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'badge' => $user->unreadNotifications()->count(),
        ])->all();

        Http::asJson()->post('https://exp.host/--/api/v2/push/send', $messages);
    }

    public function sendToToken(string $expoPushToken, string $title, string $body, array $data = []): void
    {
        Http::asJson()->post('https://exp.host/--/api/v2/push/send', [[
            'to' => $expoPushToken,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]]);
    }
}
