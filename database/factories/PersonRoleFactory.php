<?php

namespace Database\Factories;

use App\Models\PersonRole;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonRoleFactory extends Factory
{
    protected $model = PersonRole::class;

    public function definition(): array
    {
        return [
            'role' => 'contributor',
        ];
    }
}
