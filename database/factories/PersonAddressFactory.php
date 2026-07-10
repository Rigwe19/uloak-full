<?php

namespace Database\Factories;

use App\Models\PersonAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonAddressFactory extends Factory
{
    protected $model = PersonAddress::class;

    public function definition(): array
    {
        return [
            'type' => 'residence',
            'country' => fake()->country(),
        ];
    }
}
