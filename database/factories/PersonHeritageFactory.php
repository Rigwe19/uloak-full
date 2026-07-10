<?php

namespace Database\Factories;

use App\Models\PersonHeritage;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonHeritageFactory extends Factory
{
    protected $model = PersonHeritage::class;

    public function definition(): array
    {
        return [
            'nationality' => fake()->country(),
        ];
    }
}
