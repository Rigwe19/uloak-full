<?php

namespace Database\Factories;

use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'created_by' => User::factory(),
            'room_type' => 'general',
            'enable_tributes' => false,
            'enable_condolence_attendance' => false,
            'enable_candle_lighting' => false,
        ];
    }

    /**
     * Legacy rooms created before monetization: unlimited, always open.
     */
    public function legacy(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier_type' => null,
            'storage_limit_bytes' => null,
            'status' => RoomStatus::Active->value,
        ]);
    }

    public function starter(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier_type' => RoomTier::Starter->value,
            'storage_used_bytes' => 0,
            'storage_limit_bytes' => 1_073_741_824,
            'expires_at' => now()->addDays(30),
            'status' => RoomStatus::Active->value,
        ]);
    }

    public function fullRoom(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier_type' => RoomTier::FullRoom->value,
            'storage_used_bytes' => 0,
            'storage_limit_bytes' => 10_737_418_240,
            'expires_at' => now()->addMonths(12),
            'status' => RoomStatus::Active->value,
        ]);
    }

    public function familyArchive(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier_type' => RoomTier::FamilyArchive->value,
            'storage_used_bytes' => 0,
            'storage_limit_bytes' => 26_843_545_600,
            'status' => RoomStatus::Active->value,
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RoomStatus::Draft->value,
        ]);
    }
}
