<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\Billing\PaymentService;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(
        protected PaymentService $payments,
        protected PricingService $pricing,
    ) {}

    /**
     * Start or renew a Family Archive subscription.
     * Creates a pending payment for the subscription tier, then delegates to the gateway.
     * The webhook/callback will extend or create the subscription record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'region' => ['required', 'string'],
            'tier' => ['required', 'string', 'in:family_monthly,family_yearly'],
            'provider' => ['nullable', 'string', 'in:paystack,paypal,stripe'],
            'ref_code' => ['nullable', 'string', 'max:32'],
        ]);

        $user = $request->user();
        $region = $this->pricing->resolveRegion($validated['region']);
        $refCode = $validated['ref_code'] ?? $request->session()->get('referral_code') ?? $request->cookie('ulo_ref');

        $payment = $this->payments->createCheckout($user, null, [
            'region' => $region->value,
            'tier' => $validated['tier'],
            'provider' => $validated['provider'] ?? null,
            'ref_code' => $refCode,
            'utm' => $request->session()->get('utm', []),
        ]);

        $gateway = $this->payments->gatewayFor($payment->provider);
        $result = $gateway->initialize($payment);

        if (empty($payment->provider_reference)) {
            $payment->update(['provider_reference' => $result['reference']]);
        }

        return response()->json([
            'payment_id' => $payment->id,
            'authorization_url' => $result['authorization_url'],
            'reference' => $result['reference'],
        ]);
    }

    /**
     * Cancel at period end — access continues until current_period_end.
     */
    public function cancel(Request $request, int $subscription): JsonResponse
    {
        $sub = $request->user()->subscriptions()->findOrFail($subscription);

        $sub->update(['cancel_at_period_end' => true]);

        return response()->json(['message' => 'Subscription will cancel at the end of the current period.']);
    }

    /**
     * Move a completed Full/Wedding room into the active Family Archive.
     */
    public function moveRoom(Request $request, Room $room): JsonResponse
    {
        $roomModel = $room;

        try {
            $this->payments->moveRoomToArchive($roomModel, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Room moved into your Family Archive.']);
    }

    public function index(Request $request): JsonResponse
    {
        $subs = $request->user()->subscriptions()->latest()->get()->map(fn ($s) => [
            'id' => $s->id,
            'tier' => $s->tier->value,
            'tier_label' => $s->tier->label(),
            'status' => $s->status->value,
            'current_period_start' => $s->current_period_start->toDateString(),
            'current_period_end' => $s->current_period_end->toDateString(),
            'cancel_at_period_end' => $s->cancel_at_period_end,
        ]);

        return response()->json(['subscriptions' => $subs]);
    }
}
