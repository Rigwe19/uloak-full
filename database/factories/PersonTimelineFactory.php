<?php

namespace Database\Factories;

use App\Models\PersonTimeline;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonTimelineFactory extends Factory
{
    protected $model = PersonTimeline::class;

    public function definition(): array
    {
        return [
            'event_type' => 'family_event',
            'title' => fake()->sentence(3),
            'date' => fake()->date(),
            'sort_order' => 0,
        ];
    }
}
