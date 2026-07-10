<?php

namespace Database\Factories;

use App\Models\PersonTitle;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonTitleFactory extends Factory
{
    protected $model = PersonTitle::class;

    public function definition(): array
    {
        return [
            'title' => fake()->word(),
            'is_traditional' => false,
        ];
    }
}
