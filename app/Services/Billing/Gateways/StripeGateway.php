<?php

namespace App\Services\Billing\Gateways;

use App\Models\Payment;
use App\Services\Billing\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StripeGateway implements PaymentGatewayInterface
{
    public function initialize(Payment $payment): array
    {
        $secret = config('services.stripe.secret_key');

        if (empty($secret)) {
            throw new \RuntimeException('Stripe secret key is not configured.');
        }

        $user = $payment->user;
        $successUrl = route('billing.callback', ['provider' => 'stripe']).'?session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = route('pricing').'?canceled=1';

        // Stripe amounts are in minor units already; currency must be lowercase.
        $response = Http::withBasicAuth($secret, '')
            ->asForm()
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'client_reference_id' => $payment->idempotency_key,
                'customer_email' => $user->email,
                'line_items[0][price_data][currency]' => strtolower($payment->currency),
                'line_items[0][price_data][unit_amount]' => $payment->amount,
                'line_items[0][price_data][product_data][name]' => $payment->room?->name ?? 'Ulo Room',
                'line_items[0][quantity]' => 1,
                'metadata[payment_id]' => $payment->id,
            ]);

        if (! $response->successful()) {
            Log::error('Stripe checkout session creation failed', ['body' => $response->body(), 'payment_id' => $payment->id]);
            throw new \RuntimeException('Failed to initialize Stripe payment: '.$response->body());
        }

        $data = $response->json();

        // Store the Stripe session id as provider_reference for later verification.
        $payment->update(['provider_reference' => $data['id']]);

        return [
            'authorization_url' => $data['url'],
            'reference' => $data['id'],
        ];
    }

    public function verify(string $reference): array
    {
        $secret = config('services.stripe.secret_key');

        if (empty($secret)) {
            return ['verified' => false, 'amount' => null, 'currency' => null, 'status' => 'config_missing'];
        }

        // Reference may be a Stripe session id (cs_...) or payment idempotency key.
        // Try checkout session first.
        if (str_starts_with($reference, 'cs_')) {
            $response = Http::withBasicAuth($secret, '')
                ->get("https://api.stripe.com/v1/checkout/sessions/{$reference}");

            if (! $response->successful()) {
                return ['verified' => false, 'amount' => null, 'currency' => null, 'status' => 'verify_failed'];
            }

            $data = $response->json();
            $paid = ($data['payment_status'] ?? '') === 'paid';

            return [
                'verified' => $paid,
                'amount' => isset($data['amount_total']) ? (int) $data['amount_total'] : null,
                'currency' => isset($data['currency']) ? strtoupper($data['currency']) : null,
                'status' => $data['payment_status'] ?? 'unknown',
            ];
        }

        // Fallback: look up payment intent.
        $response = Http::withBasicAuth($secret, '')
            ->get("https://api.stripe.com/v1/payment_intents/{$reference}");

        if (! $response->successful()) {
            return ['verified' => false, 'amount' => null, 'currency' => null, 'status' => 'verify_failed'];
        }

        $data = $response->json();

        return [
            'verified' => ($data['status'] ?? '') === 'succeeded',
            'amount' => isset($data['amount']) ? (int) $data['amount'] : null,
            'currency' => isset($data['currency']) ? strtoupper($data['currency']) : null,
            'status' => $data['status'] ?? 'unknown',
        ];
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $webhookSecret = config('services.stripe.webhook_secret');

        if (empty($webhookSecret)) {
            return false;
        }

        $signature = $request->header('Stripe-Signature');

        if (empty($signature)) {
            return false;
        }

        // Parse Stripe-Signature: t=timestamp,v1=sig[,v0=...]
        $parts = [];
        foreach (explode(',', $signature) as $part) {
            [$k, $v] = explode('=', $part, 2) + [null, null];
            $parts[$k] = $v;
        }

        if (! isset($parts['t'], $parts['v1'])) {
            return false;
        }

        $payload = $parts['t'].'.'.$request->getContent();
        $expected = hash_hmac('sha256', $payload, $webhookSecret);

        return hash_equals($expected, $parts['v1']);
    }
}
