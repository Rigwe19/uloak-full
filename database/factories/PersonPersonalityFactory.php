<?php

namespace Database\Factories;

use App\Models\PersonPersonality;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonPersonalityFactory extends Factory
{
    protected $model = PersonPersonality::class;

    public function definition(): array
    {
        return [
            'section' => 'summary',
            'content' => fake()->paragraph(),
            'sort_order' => 0,
        ];
    }
}
