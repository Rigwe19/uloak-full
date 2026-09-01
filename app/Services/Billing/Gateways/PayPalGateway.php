<?php

namespace App\Services\Billing\Gateways;

use App\Models\Payment;
use App\Services\Billing\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayPalGateway implements PaymentGatewayInterface
{
    public function initialize(Payment $payment): array
    {
        $token = $this->accessToken();

        $returnUrl = route('billing.callback', ['provider' => 'paypal']);
        $cancelUrl = route('pricing').'?canceled=1';

        $response = Http::withToken($token)
            ->post($this->baseUrl().'/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => $payment->idempotency_key,
                        'amount' => [
                            'currency_code' => $payment->currency,
                            'value' => number_format($payment->amount / 100, 2, '.', ''),
                        ],
                        'custom_id' => (string) $payment->id,
                    ],
                ],
                'application_context' => [
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl,
                    'brand_name' => 'Ulo',
                    'user_action' => 'PAY_NOW',
                ],
            ]);

        if (! $response->successful()) {
            Log::error('PayPal order creation failed', ['body' => $response->body(), 'payment_id' => $payment->id]);
            throw new \RuntimeException('Failed to initialize PayPal payment: '.$response->body());
        }

        $data = $response->json();
        $orderId = $data['id'];

        $approveUrl = collect($data['links'] ?? [])->firstWhere('rel', 'approve')['href'] ?? null;

        if ($approveUrl === null) {
            throw new \RuntimeException('PayPal order created but no approve link returned.');
        }

        $payment->update(['provider_reference' => $orderId]);

        return [
            'authorization_url' => $approveUrl,
            'reference' => $orderId,
        ];
    }

    public function verify(string $reference): array
    {
        try {
            $token = $this->accessToken();
        } catch (\Throwable $e) {
            return ['verified' => false, 'amount' => null, 'currency' => null, 'status' => 'config_missing'];
        }

        $response = Http::withToken($token)
            ->get($this->baseUrl()."/v2/checkout/orders/{$reference}");

        if (! $response->successful()) {
            return ['verified' => false, 'amount' => null, 'currency' => null, 'status' => 'verify_failed'];
        }

        $data = $response->json();
        $status = $data['status'] ?? '';

        // COMPLETED means captured; APPROVED means authorized but not yet captured.
        $verified = $status === 'COMPLETED';

        $purchaseUnit = $data['purchase_units'][0] ?? [];
        $amount = $purchaseUnit['payments']['captures'][0]['amount']['value'] ?? $purchaseUnit['amount']['value'] ?? null;
        $currency = $purchaseUnit['payments']['captures'][0]['amount']['currency_code'] ?? $purchaseUnit['amount']['currency_code'] ?? null;

        return [
            'verified' => $verified,
            'amount' => $amount !== null ? (int) round((float) $amount * 100) : null,
            'currency' => $currency,
            'status' => $status,
        ];
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $webhookId = config('services.paypal.webhook_id');

        if (empty($webhookId)) {
            // Without a webhook id we cannot verify; reject by default.
            return false;
        }

        try {
            $token = $this->accessToken();
        } catch (\Throwable) {
            return false;
        }

        $response = Http::withToken($token)
            ->post($this->baseUrl().'/v1/notifications/verify-webhook-signature', [
                'transmission_id' => $request->header('PAYPAL-TRANSMISSION-ID'),
                'transmission_time' => $request->header('PAYPAL-TRANSMISSION-TIME'),
                'cert_id' => $request->header('PAYPAL-CERT-ID'),
                'auth_algo' => $request->header('PAYPAL-AUTH-ALGO'),
                'transmission_sig' => $request->header('PAYPAL-TRANSMISSION-SIG'),
                'webhook_id' => $webhookId,
                'webhook_event' => json_decode($request->getContent(), true),
            ]);

        return $response->json('verification_status') === 'SUCCESS';
    }

    private function accessToken(): string
    {
        $clientId = config('services.paypal.client_id');
        $secret = config('services.paypal.client_secret');

        if (empty($clientId) || empty($secret)) {
            throw new \RuntimeException('PayPal credentials are not configured.');
        }

        $mode = config('services.paypal.mode', 'sandbox');

        $base = $mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        $response = Http::withBasicAuth($clientId, $secret)
            ->asForm()
            ->post($base.'/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('PayPal OAuth failed: '.$response->body());
        }

        return $response->json('access_token');
    }

    private function baseUrl(): string
    {
        $mode = config('services.paypal.mode', 'sandbox');

        return $mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    }
}
