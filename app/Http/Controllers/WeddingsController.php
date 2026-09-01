<?php

namespace App\Http\Controllers;

use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Partner;
use App\Models\Room;
use App\Services\Billing\PaymentService;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WeddingsController extends Controller
{
    public function __construct(
        protected PaymentService $payments,
    ) {}

    public function create(Request $request)
    {
        // GET renders the form; auth is handled in the Inertia page, but also guard here.
        if ($request->isMethod('get')) {
            $pricingService = app(PricingService::class);
            $detected = $pricingService->detectRegion($request);
            if (! $request->session()->has('pricing_region')) {
                $request->session()->put('pricing_region', $detected->value);
            } else {
                $detected = $pricingService->resolveRegion($request->session()->get('pricing_region'));
            }

            return Inertia::render('weddings/create', [
                'pricing' => $pricingService->allRegionPricing(),
                'defaultRegion' => $detected->value,
                'refCode' => $request->session()->get('referral_code') ?? $request->cookie('ulo_ref'),
            ]);
        }

        // POST creates the draft room and initiates checkout.
        // Now supports any paywalled occasion (wedding, birthday, burial, memorial, anniversary, graduation).
        // Dashboard blocks these via redirect, so this funnel is the only paid entry point for them.
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tribute_name' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'wedding_dates' => ['nullable', 'string', 'max:1000'],
            'welcome_message' => ['nullable', 'string', 'max:2000'],
            'privacy' => ['nullable', 'string', 'in:public,private'],
            'room_type' => ['nullable', 'string', 'in:wedding,birthday,burial,memorial,anniversary,graduation,general'],
            'region' => ['nullable', 'string'],
            'ref_code' => ['nullable', 'string', 'max:32'],
        ]);

        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        $region = app(PricingService::class)->resolveRegion($validated['region'] ?? $request->session()->get('pricing_region'))->value;
        $request->session()->put('pricing_region', $region);
        $refCode = $validated['ref_code'] ?? $request->session()->get('referral_code') ?? $request->cookie('ulo_ref');
        $weddingDates = null;
        if (! empty($validated['wedding_dates'])) {
            $parts = array_filter(array_map('trim', explode(',', $validated['wedding_dates'])));
            $weddingDates = $parts !== [] ? array_values($parts) : null;
        }

        $room = null;

        DB::transaction(function () use (&$room, $user, $validated, $weddingDates, $refCode) {
            $partnerId = null;
            if (is_string($refCode) && $refCode !== '') {
                $partner = Partner::where('ref_code', $refCode)->where('is_active', true)->first();
                $partnerId = $partner?->id;
            }

            $room = Room::create([
                'name' => $validated['name'],
                'tribute_name' => $validated['tribute_name'] ?? null,
                'description' => $validated['welcome_message'] ?? null,
                'welcome_message' => $validated['welcome_message'] ?? null,
                'privacy' => $validated['privacy'] ?? 'private',
                'room_type' => $validated['room_type'] ?? 'wedding',
                'tier_type' => null, // becomes full_room only after successful payment
                'status' => RoomStatus::Draft->value,
                'created_by' => $user->id,
                'start_date' => $validated['start_date'] ?? null,
                'wedding_dates' => $weddingDates,
                'referral_partner_id' => $partnerId,
                'storage_used_bytes' => 0,
            ]);
        });

        // Create pending payment for this draft room.
        $payment = $this->payments->createCheckout($user, $room, [
            'region' => $region,
            'tier' => RoomTier::FullRoom->value,
            'ref_code' => $refCode,
            'utm' => $request->session()->get('utm', []),
        ]);

        $gateway = $this->payments->gatewayFor($payment->provider);
        $result = $gateway->initialize($payment);

        if (empty($payment->provider_reference)) {
            $payment->update(['provider_reference' => $result['reference']]);
        }

        // Inertia POST expects a redirect or JSON; for full-page form we redirect to provider.
        if ($request->header('X-Inertia')) {
            return Inertia::location($result['authorization_url']);
        }

        return redirect()->away($result['authorization_url']);
    }
}
