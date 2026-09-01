<?php

namespace App\Http\Controllers\Billing;

use App\Enums\PaymentProvider;
use App\Http\Controllers\Controller;
use App\Services\Billing\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        protected PaymentService $payments,
    ) {}

    /**
     * Handle provider webhooks. CSRF-exempt via bootstrap/app.php.
     * Must verify signature before processing; handler is idempotent.
     */
    public function handle(Request $request, string $provider): JsonResponse
    {
        $enum = PaymentProvider::tryFrom($provider);

        if ($enum === null) {
            return response()->json(['message' => 'Unknown provider'], 404);
        }

        $gateway = $this->payments->gatewayFor($enum);

        if (! $gateway->verifyWebhookSignature($request)) {
            Log::warning('Webhook signature verification failed', ['provider' => $provider, 'ip' => $request->ip()]);

            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $payload = $request->all();

        $reference = match ($enum) {
            PaymentProvider::Paystack => $payload['data']['reference'] ?? null,
            PaymentProvider::Stripe => $payload['data']['object']['id'] ?? $payload['data']['id'] ?? null,
            PaymentProvider::PayPal => $payload['resource']['id'] ?? null,
        };

        if (empty($reference)) {
            return response()->json(['message' => 'No reference in payload'], 200);
        }

        $payment = $this->payments->findByProviderReference($reference)
            ?? $this->payments->findByIdempotencyKey($reference);

        if ($payment === null) {
            Log::info('Webhook for unknown payment', ['provider' => $provider, 'reference' => $reference]);

            return response()->json(['message' => 'Payment not found'], 200);
        }

        // Only act on success events.
        $eventType = $payload['event'] ?? $payload['type'] ?? $payload['event_type'] ?? '';

        $isSuccessEvent = match ($enum) {
            PaymentProvider::Paystack => $eventType === 'charge.success',
            PaymentProvider::Stripe => $eventType === 'checkout.session.completed' || $eventType === 'payment_intent.succeeded',
            PaymentProvider::PayPal => $eventType === 'CHECKOUT.ORDER.APPROVED' || $eventType === 'PAYMENT.CAPTURE.COMPLETED',
        };

        if ($isSuccessEvent) {
            $this->payments->verifyAndActivate($payment, $reference);
        }

        return response()->json(['message' => 'ok']);
    }
}
