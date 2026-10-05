<?php

namespace Database\Factories;

use App\Enums\CreatorType;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CreatorProfile>
 */
class CreatorProfileFactory extends Factory
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
            'creator_type' => CreatorType::Normal,
            'ref_code' => strtoupper($this->faker->unique()->lexify('????????')),
            'commission_rate' => null,
            'is_approved_vip' => false,
            'payout_details' => null,
        ];
    }

    public function vip(): static
    {
        return $this->state(fn (array $attributes) => [
            'creator_type' => CreatorType::Vip,
            'is_approved_vip' => true,
        ]);
    }
}
