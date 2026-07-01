<?php

namespace Database\Factories;

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
}
