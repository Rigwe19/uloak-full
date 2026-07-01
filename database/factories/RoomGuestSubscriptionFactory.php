<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\RoomGuestSubscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomGuestSubscription>
 */
class RoomGuestSubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'room_id' => Room::factory(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
        ];
    }
}
