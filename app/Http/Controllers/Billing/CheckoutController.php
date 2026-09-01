<?php

namespace App\Http\Controllers\Billing;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\Region;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Room;
use App\Services\Billing\PaymentService;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function __construct(
        protected PaymentService $payments,
        protected PricingService $pricing,
    ) {}

    /**
     * Initiate checkout. Creates a pending Payment and redirects to the provider.
     * Accepts room_id (nullable for subscriptions), selected region, tier, and ref_code.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'room_id' => ['nullable', 'exists:rooms,id'],
            'region' => ['required', 'string'],
            'tier' => ['required', 'string'],
            'provider' => ['nullable', 'string', 'in:paystack,paypal,stripe'],
            'ref_code' => ['nullable', 'string', 'max:32'],
        ]);

        $user = $request->user();

        if ($user === null) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        // Resolve room if provided — must be owned by the authenticated user or be a draft.
        $room = null;
        if (! empty($validated['room_id'])) {
            $room = Room::findOrFail($validated['room_id']);

            // Only owner or draft rooms can be paid for.
            if ($room->created_by !== $user->id && $room->status->value !== 'draft') {
                abort(403, 'You do not own this room.');
            }
        }

        // Pull referral + UTM from session/cookie if not supplied directly.
        $refCode = $validated['ref_code'] ?? $request->session()->get('referral_code') ?? $request->cookie('ulo_ref');
        $utm = $request->session()->get('utm', []);

        try {
            $payment = $this->payments->createCheckout($user, $room, [
                'region' => $validated['region'],
                'tier' => $validated['tier'],
                'provider' => $validated['provider'] ?? null,
                'ref_code' => $refCode,
                'utm' => $utm,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        // For free tiers (Starter) — no payment needed, just activate.
        if ($payment->amount === 0) {
            return response()->json([
                'payment_id' => $payment->id,
                'status' => 'free',
                'redirect_url' => $room ? route('dashboard.rooms.show', $room) : route('dashboard'),
            ]);
        }

        try {
            $gateway = $this->payments->gatewayFor($payment->provider);
            $result = $gateway->initialize($payment);

            // Keep provider reference for callback matching.
            if (empty($payment->provider_reference)) {
                $payment->update(['provider_reference' => $result['reference']]);
            }

            return response()->json([
                'payment_id' => $payment->id,
                'authorization_url' => $result['authorization_url'],
                'reference' => $result['reference'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Checkout initialization failed', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
            $payment->update(['status' => PaymentStatus::Failed]);

            return response()->json(['message' => 'Failed to initialize payment. Please try again.'], 500);
        }
    }

    /**
     * Provider callback — user returns here after paying.
     * Verifies the payment idempotently and redirects appropriately.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        $enum = PaymentProvider::tryFrom($provider);

        if ($enum === null) {
            abort(404);
        }

        // Provider-specific reference extraction.
        $reference = match ($enum) {
            PaymentProvider::Paystack => $request->query('reference') ?? $request->query('trxref'),
            PaymentProvider::Stripe => $request->query('session_id'),
            PaymentProvider::PayPal => $request->query('token'),
        };

        if (empty($reference)) {
            return redirect()->route('pricing')->with('error', 'Payment reference missing. Please contact support if you were charged.');
        }

        $payment = $this->payments->findByProviderReference($reference)
            ?? $this->payments->findByIdempotencyKey($reference);

        // Fallback: Paystack may return idempotency_key as reference; Stripe returns session id stored as provider_reference.
        if ($payment === null) {
            // For Stripe/PayPal the reference may not yet be stored — try lookup by session/order id query param.
            return redirect()->route('pricing')->with('error', 'Payment record not found. Please contact support.');
        }

        $this->payments->verifyAndActivate($payment, $reference);

        $payment->refresh();

        if ($payment->status === PaymentStatus::Successful) {
            $room = $payment->room;

            return redirect()
                ->route($room ? 'dashboard.rooms.show' : 'dashboard', $room ?? [])
                ->with('success', 'Payment confirmed — your room is now active.');
        }

        if ($payment->status === PaymentStatus::Failed) {
            return redirect()->route('pricing')->with('error', 'Payment could not be verified. Please try again or contact support.');
        }

        return redirect()->route('pricing')->with('info', 'Payment is being confirmed. You will be notified once verified.');
    }

    /**
     * Lightweight status check for polling during pending.
     */
    public function status(Request $request, int $payment): JsonResponse
    {
        $record = Payment::findOrFail($payment);

        if ($record->user_id !== $request->user()?->id) {
            abort(403);
        }

        return response()->json([
            'status' => $record->status->value,
            'provider' => $record->provider->value,
            'amount' => $record->amount,
            'currency' => $record->currency,
            'paid_at' => $record->paid_at?->toIso8601String(),
        ]);
    }
}
