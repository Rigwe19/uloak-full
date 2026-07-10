<?php

namespace Database\Factories;

use App\Models\PersonTag;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonTagFactory extends Factory
{
    protected $model = PersonTag::class;

    public function definition(): array
    {
        return [
            'tag' => fake()->word(),
        ];
    }
}
