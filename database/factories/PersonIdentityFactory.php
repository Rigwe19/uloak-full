<?php

namespace Database\Factories;

use App\Models\PersonIdentity;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonIdentityFactory extends Factory
{
    protected $model = PersonIdentity::class;

    public function definition(): array
    {
        return [
            'legal_name' => fake()->name(),
            'display_name' => fake()->firstName(),
            'gender' => fake()->randomElement(['male', 'female']),
            'age_visibility' => 'public',
        ];
    }
}
