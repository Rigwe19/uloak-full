<?php

namespace Database\Factories;

use App\Models\PersonRelationshipSource;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonRelationshipSourceFactory extends Factory
{
    protected $model = PersonRelationshipSource::class;

    public function definition(): array
    {
        return [
            'type' => 'oral',
            'description' => fake()->sentence(),
        ];
    }
}
