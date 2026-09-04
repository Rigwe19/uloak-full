<?php

namespace Database\Factories;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\Region;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'room_id' => Room::factory(),
            'amount' => 15_000_000,
            'currency' => 'NGN',
            'provider' => PaymentProvider::Paystack,
            'provider_reference' => Str::random(20),
            'idempotency_key' => (string) Str::uuid(),
            'status' => PaymentStatus::Pending,
            'region' => Region::Nigeria,
        ];
    }

    public function successful(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Successful,
            'paid_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Failed,
        ]);
    }

    public function withPartner(?Partner $partner = null): static
    {
        return $this->state(fn (array $attributes) => [
            'partner_id' => $partner?->getKey() ?? Partner::factory(),
            'commission_amount' => 300_000,
        ]);
    }
}
