<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\SubscriptionResource;
use App\Services\Billing\PaymentService;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    public function __construct(protected PaymentService $payments, protected PricingService $pricing) {}

    public function index(Request $request): JsonResponse
    {
        $subs = $request->user()->subscriptions()->latest()->get();

        return response()->json(['data' => SubscriptionResource::collection($subs)]);
    }

    /**
     * Start a Family Archive or Viewer subscription. Mirrors the web
     * SubscriptionController but returns JSON for mobile checkout.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'region' => ['required', 'string'],
            'tier' => ['required', 'string', 'in:family_monthly,family_yearly,viewer_monthly,viewer_yearly,viewer_vip_monthly,viewer_vip_yearly'],
            'provider' => ['nullable', 'string', 'in:paystack,paypal,stripe'],
            'ref_code' => ['nullable', 'string', 'max:32'],
        ]);

        $user = $request->user();
        $region = $this->pricing->resolveRegion($validated['region']);
        $refCode = $validated['ref_code'] ?? $request->cookie('ulo_ref');
        $utm = $request->hasSession() ? $request->session()->get('utm', []) : [];

        try {
            $payment = $this->payments->createCheckout($user, null, [
                'region' => $region->value,
                'tier' => $validated['tier'],
                'provider' => $validated['provider'] ?? null,
                'ref_code' => $refCode,
                'utm' => $utm,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        try {
            $gateway = $this->payments->gatewayFor($payment->provider);
            $result = $gateway->initialize($payment);

            if (empty($payment->provider_reference)) {
                $payment->update(['provider_reference' => $result['reference']]);
            }

            return response()->json([
                'data' => new PaymentResource($payment->fresh()),
                'authorization_url' => $result['authorization_url'],
                'reference' => $result['reference'],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Subscription checkout init failed', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
            $payment->update(['status' => PaymentStatus::Failed]);

            return response()->json(['message' => 'Failed to initialize payment.'], 500);
        }
    }

    /**
     * Cancel at period end — access continues until current_period_end.
     */
    public function cancel(Request $request, int $subscription): JsonResponse
    {
        $sub = $request->user()->subscriptions()->findOrFail($subscription);
        $sub->update(['cancel_at_period_end' => true]);

        return response()->json([
            'data' => new SubscriptionResource($sub->refresh()),
            'message' => 'Subscription will cancel at the end of the current period.',
        ]);
    }
}
