<?php

namespace App\Services\Billing\Contracts;

use App\Models\Payment;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * Initialize a checkout session/transaction with the provider.
     * Returns the URL the user should be redirected to.
     *
     * @return array{authorization_url: string, reference: string}
     */
    public function initialize(Payment $payment): array;

    /**
     * Verify a transaction by provider reference.
     *
     * @return array{verified: bool, amount: int|null, currency: string|null, status: string}
     */
    public function verify(string $reference): array;

    /**
     * Verify an incoming webhook signature.
     */
    public function verifyWebhookSignature(Request $request): bool;
}
