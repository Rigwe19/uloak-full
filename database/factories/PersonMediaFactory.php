<?php

namespace Database\Factories;

use App\Models\PersonMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonMediaFactory extends Factory
{
    protected $model = PersonMedia::class;

    public function definition(): array
    {
        return [
            'role' => 'archive',
            'sort_order' => 0,
        ];
    }
}
