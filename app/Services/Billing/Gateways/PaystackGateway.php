<?php

namespace App\Services\Billing\Gateways;

use App\Models\Payment;
use App\Services\Billing\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackGateway implements PaymentGatewayInterface
{
    public function initialize(Payment $payment): array
    {
        $secret = config('services.paystack.secret_key');

        if (empty($secret)) {
            throw new \RuntimeException('Paystack secret key is not configured.');
        }

        $user = $payment->user;
        $callbackUrl = route('billing.callback', ['provider' => 'paystack']);

        $response = Http::withToken($secret)
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $user->email,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'reference' => $payment->idempotency_key,
                'callback_url' => $callbackUrl,
                'metadata' => [
                    'payment_id' => $payment->id,
                    'room_id' => $payment->room_id,
                ],
            ]);

        if (! $response->successful()) {
            Log::error('Paystack initialize failed', ['body' => $response->body(), 'payment_id' => $payment->id]);
            throw new \RuntimeException('Failed to initialize Paystack payment: '.$response->body());
        }

        $data = $response->json('data');

        return [
            'authorization_url' => $data['authorization_url'],
            'reference' => $data['reference'],
        ];
    }

    public function verify(string $reference): array
    {
        $secret = config('services.paystack.secret_key');

        if (empty($secret)) {
            return ['verified' => false, 'amount' => null, 'currency' => null, 'status' => 'config_missing'];
        }

        $response = Http::withToken($secret)
            ->get("https://api.paystack.co/transaction/verify/{$reference}");

        if (! $response->successful()) {
            return ['verified' => false, 'amount' => null, 'currency' => null, 'status' => 'verify_failed'];
        }

        $data = $response->json('data');
        $status = $data['status'] ?? '';

        return [
            'verified' => $status === 'success',
            'amount' => isset($data['amount']) ? (int) $data['amount'] : null,
            'currency' => $data['currency'] ?? null,
            'status' => $status,
        ];
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $secret = config('services.paystack.secret_key');

        if (empty($secret)) {
            return false;
        }

        $signature = $request->header('x-paystack-signature');

        if (empty($signature)) {
            return false;
        }

        $computed = hash_hmac('sha512', $request->getContent(), $secret);

        return hash_equals($computed, $signature);
    }
}
