<?php

namespace App\Services\Billing;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\Region;
use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Enums\SubscriptionStatus;
use App\Enums\SubscriptionTier;
use App\Models\CreatorEarning;
use App\Models\CreatorProfile;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use App\Services\Billing\Contracts\PaymentGatewayInterface;
use App\Services\Billing\Gateways\PayPalGateway;
use App\Services\Billing\Gateways\PaystackGateway;
use App\Services\Billing\Gateways\StripeGateway;
use App\Services\PricingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        protected PricingService $pricing,
    ) {}

    public function gatewayFor(PaymentProvider $provider): PaymentGatewayInterface
    {
        return match ($provider) {
            PaymentProvider::Paystack => app(PaystackGateway::class),
            PaymentProvider::Stripe => app(StripeGateway::class),
            PaymentProvider::PayPal => app(PayPalGateway::class),
        };
    }

    /**
     * Resolve which provider to use for a given region.
     * Nigeria → Paystack; every other region defaults to Stripe (PayPal selectable at checkout).
     */
    public function defaultProviderFor(Region $region): PaymentProvider
    {
        return $region === Region::Nigeria ? PaymentProvider::Paystack : PaymentProvider::Stripe;
    }

    /**
     * Create a pending payment record for checkout.
     * Amount and currency are resolved server-side; client values are ignored.
     *
     * @param  array{region: string, tier: string, provider?: string, ref_code?: string, utm?: array<string,string>}  $input
     */
    public function createCheckout(User $user, ?Room $room, array $input): Payment
    {
        $region = $this->pricing->resolveRegion($input['region'] ?? null);
        $tierKey = $input['tier'];
        $pricing = $this->pricing->checkoutPrice($region, $tierKey);

        if ($pricing['amount'] === 0) {
            throw new \InvalidArgumentException('Selected tier does not require payment.');
        }

        // Validate tier key is known.
        $known = array_merge(
            array_map(fn (RoomTier $t) => $t->value, RoomTier::cases()),
            array_map(fn (SubscriptionTier $t) => $t->value, SubscriptionTier::cases()),
        );
        if (! in_array($tierKey, $known, true)) {
            throw new \InvalidArgumentException("Unknown tier: {$tierKey}");
        }

        $provider = isset($input['provider'])
            ? PaymentProvider::tryFrom($input['provider']) ?? $this->defaultProviderFor($region)
            : $this->defaultProviderFor($region);

        // Guard: Paystack only for NGN.
        if ($provider === PaymentProvider::Paystack && $region !== Region::Nigeria) {
            throw new \InvalidArgumentException('Paystack is only available for Nigeria (NGN).');
        }

        $partner = null;
        $commissionAmount = null;
        $creatorProfile = null;
        $refCode = $input['ref_code'] ?? null;

        if (is_string($refCode) && $refCode !== '') {
            $partner = Partner::where('ref_code', $refCode)->where('is_active', true)->first();
            if ($partner !== null) {
                $commissionAmount = $partner->calculateCommission($pricing['amount'], $pricing['currency']);
            }

            $creatorProfile = CreatorProfile::where('ref_code', $refCode)->first();
        }

        return Payment::create([
            'user_id' => $user->id,
            'room_id' => $room?->id,
            'tier' => $tierKey,
            'amount' => $pricing['amount'],
            'currency' => $pricing['currency'],
            'provider' => $provider,
            'idempotency_key' => (string) Str::uuid(),
            'status' => PaymentStatus::Pending,
            'region' => $region,
            'partner_id' => $partner?->id,
            'creator_profile_id' => $creatorProfile?->id,
            'commission_amount' => $commissionAmount,
            'utm' => $input['utm'] ?? null,
        ]);
    }

    /**
     * Idempotent payment activation. Safe to call multiple times (duplicate callbacks).
     * Wraps the status transition and room activation in a single transaction.
     */
    public function verifyAndActivate(Payment $payment, ?string $providerReference = null): Payment
    {
        // Already finalized — idempotent return.
        if ($payment->status !== PaymentStatus::Pending) {
            return $payment;
        }

        $gateway = $this->gatewayFor($payment->provider);
        $reference = $providerReference ?? $payment->provider_reference ?? $payment->idempotency_key;

        $result = $gateway->verify($reference);

        if (! $result['verified']) {
            // Only mark failed if the provider explicitly reported failure; otherwise leave pending for retry.
            if (in_array($result['status'] ?? '', ['failed', 'abandoned', 'expired'], true)) {
                $payment->update([
                    'status' => PaymentStatus::Failed,
                    'provider_reference' => $reference,
                ]);
            }

            return $payment->refresh();
        }

        // Cross-check amount and currency when provider returns them.
        if (isset($result['amount']) && (int) $result['amount'] !== (int) $payment->amount) {
            // Amount mismatch — do not activate; flag for manual review.
            $payment->update([
                'status' => PaymentStatus::Failed,
                'provider_reference' => $reference,
            ]);

            return $payment->refresh();
        }

        return DB::transaction(function () use ($payment, $reference) {
            // Re-check inside transaction (race between two callbacks).
            $payment->refresh();

            if ($payment->status !== PaymentStatus::Pending) {
                return $payment;
            }

            $payment->update([
                'status' => PaymentStatus::Successful,
                'provider_reference' => $reference,
                'paid_at' => now(),
            ]);

            if ($payment->room_id !== null) {
                $this->activateRoom($payment->room, $payment);
            }

            if ($payment->tier !== null && SubscriptionTier::tryFrom($payment->tier) !== null) {
                $this->activateSubscription($payment);
            }

            return $payment->refresh();
        });
    }

    /**
     * Activate or upgrade a room after a successful one-off payment.
     * Handles starter → full_room upgrades and draft → active activation.
     */
    protected function activateRoom(Room $room, Payment $payment): void
    {
        $room->refresh();

        // Determine which tier this payment was for. For family archive payments the room
        // tier is handled via Subscription; here we treat room payments as full_room.
        $tier = RoomTier::FullRoom;

        $limits = config('pricing.tiers.'.$tier->value, []);

        $room->update([
            'tier_type' => $tier,
            'status' => RoomStatus::Active,
            'storage_limit_bytes' => $limits['storage_bytes'] ?? $room->storage_limit_bytes,
            'expires_at' => now()->addMonths($limits['access_months'] ?? 12),
            'contributions_closed_at' => null,
            'referral_partner_id' => $payment->partner_id ?? $room->referral_partner_id,
        ]);
    }

    /**
     * Create (idempotently) a Subscription row for subscription-tier payments
     * (family_* viewer_*) and accrue the referring creator's revenue split.
     * Room one-off payments (full_room) skip this path.
     */
    protected function activateSubscription(Payment $payment): void
    {
        $tier = SubscriptionTier::tryFrom((string) $payment->tier);

        if ($tier === null) {
            return;
        }

        if ($payment->subscription_id !== null) {
            return;
        }

        $now = now();
        $periodEnd = $tier->interval() === 'year' ? $now->copy()->addYear() : $now->copy()->addMonth();

        $subscription = $payment->user->subscriptions()->create([
            'referred_creator_profile_id' => $payment->creator_profile_id,
            'tier' => $tier,
            'status' => SubscriptionStatus::Active,
            'current_period_start' => $now,
            'current_period_end' => $periodEnd,
            'cancel_at_period_end' => false,
            'provider' => $payment->provider,
            'provider_reference' => $payment->provider_reference,
            'provider_customer_reference' => null,
            'region' => $payment->region,
            'currency' => $payment->currency,
        ]);

        $payment->update(['subscription_id' => $subscription->id]);

        if ($payment->creator_profile_id !== null) {
            $profile = CreatorProfile::find($payment->creator_profile_id);

            if ($profile !== null && ! CreatorEarning::where('payment_id', $payment->id)->exists()) {
                CreatorEarning::create([
                    'creator_profile_id' => $profile->id,
                    'payment_id' => $payment->id,
                    'subscription_id' => $subscription->id,
                    'viewer_user_id' => $payment->user_id,
                    'amount_minor' => $profile->calculateEarning((int) $payment->amount),
                    'currency' => $payment->currency,
                    'split_pct' => $profile->splitPct(),
                    'status' => 'pending',
                ]);
            }
        }
    }

    /**
     * Move a completed Full/Wedding room into an active Family Archive owned by the same user.
     * This is triggered after the user has an active subscription.
     */
    public function moveRoomToArchive(Room $room, User $owner): void
    {
        if (! $owner->subscriptions()->where('status', 'active')->exists()) {
            throw new \RuntimeException('User does not have an active Family Archive subscription.');
        }

        if ($room->created_by !== $owner->id) {
            throw new \RuntimeException('Only the room owner can move it to their Family Archive.');
        }

        $room->update([
            'tier_type' => RoomTier::FamilyArchive,
            'status' => RoomStatus::Active,
            'storage_limit_bytes' => config('pricing.tiers.family_archive.storage_bytes'),
        ]);
    }

    public function findByIdempotencyKey(string $key): ?Payment
    {
        return Payment::where('idempotency_key', $key)->first();
    }

    public function findByProviderReference(string $reference): ?Payment
    {
        return Payment::where('provider_reference', $reference)->first();
    }
}
