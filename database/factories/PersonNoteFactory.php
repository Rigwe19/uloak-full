<?php

namespace Database\Factories;

use App\Models\PersonNote;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonNoteFactory extends Factory
{
    protected $model = PersonNote::class;

    public function definition(): array
    {
        return [
            'body' => fake()->paragraph(),
            'visibility' => 'private',
        ];
    }
}
