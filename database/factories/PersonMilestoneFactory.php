<?php

namespace Database\Factories;

use App\Models\PersonMilestone;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonMilestoneFactory extends Factory
{
    protected $model = PersonMilestone::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'category' => 'other',
        ];
    }
}
