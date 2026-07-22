<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Story>
 */
class StoryFactory extends Factory
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
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'type' => 'video',
            'file_url' => $this->faker->imageUrl(),
            'thumbnail' => $this->faker->imageUrl(),
            'tags' => [],
            'assets' => [],
        ];
    }
}
