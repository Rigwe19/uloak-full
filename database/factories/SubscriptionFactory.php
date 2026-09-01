<?php

namespace Database\Factories;

use App\Enums\PaymentProvider;
use App\Enums\Region;
use App\Enums\SubscriptionStatus;
use App\Enums\SubscriptionTier;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
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
            'tier' => SubscriptionTier::FamilyMonthly,
            'status' => SubscriptionStatus::Active,
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
            'cancel_at_period_end' => false,
            'provider' => PaymentProvider::Stripe,
            'provider_reference' => 'sub_'.Str::random(16),
            'region' => Region::Nigeria,
            'currency' => 'NGN',
        ];
    }

    public function yearly(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => SubscriptionTier::FamilyYearly,
            'current_period_end' => now()->addYear(),
        ]);
    }

    public function canceled(): static
    {
        return $this->state(fn (array $attributes) => [
            'cancel_at_period_end' => true,
        ]);
    }
}
