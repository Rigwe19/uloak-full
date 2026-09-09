<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CheckoutRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\Room;
use App\Services\Billing\PaymentService;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    public function __construct(protected PaymentService $payments, protected PricingService $pricing) {}

    public function pricing(): JsonResponse
    {
        return response()->json(['data' => $this->pricing->allRegionPricing()]);
    }

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $room = ! empty($validated['room_id']) ? Room::findOrFail($validated['room_id']) : null;

        if ($room && $room->created_by !== $user->id && $room->status->value !== 'draft') {
            abort(403, 'You do not own this room.');
        }

        $refCode = $validated['ref_code'] ?? $request->cookie('ulo_ref');
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

        if ($payment->amount === 0) {
            return response()->json(['data' => new PaymentResource($payment->load('room')), 'free' => true], 201);
        }

        try {
            $gateway = $this->payments->gatewayFor($payment->provider);
            $result = $gateway->initialize($payment);
            if (empty($payment->provider_reference)) {
                $payment->update(['provider_reference' => $result['reference']]);
            }

            return response()->json(['data' => new PaymentResource($payment->fresh()->load('room')), 'authorization_url' => $result['authorization_url'], 'reference' => $result['reference']], 201);
        } catch (\Throwable $e) {
            Log::error('Checkout init failed', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
            $payment->update(['status' => PaymentStatus::Failed]);

            return response()->json(['message' => 'Failed to initialize payment.'], 500);
        }
    }

    public function status(Request $request, int $payment): JsonResponse
    {
        $record = Payment::findOrFail($payment);
        if ($record->user_id !== $request->user()?->id) {
            abort(403);
        }

        return response()->json(['data' => new PaymentResource($record->load('room'))]);
    }

    public function verify(Request $request, int $payment): JsonResponse
    {
        $record = Payment::findOrFail($payment);
        if ($record->user_id !== $request->user()?->id) {
            abort(403);
        }
        $reference = $request->input('reference', $record->provider_reference);
        $this->payments->verifyAndActivate($record, $reference);

        return response()->json(['data' => new PaymentResource($record->fresh()->load('room'))]);
    }
}
