<?php

namespace Database\Factories;

use App\Models\CreatorEarning;
use App\Models\CreatorProfile;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CreatorEarning>
 */
class CreatorEarningFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'creator_profile_id' => CreatorProfile::factory(),
            'payment_id' => Payment::factory(),
            'subscription_id' => null,
            'viewer_user_id' => User::factory(),
            'amount_minor' => 140_000,
            'currency' => 'NGN',
            'split_pct' => 70.0,
            'status' => 'pending',
            'paid_at' => null,
        ];
    }
}
