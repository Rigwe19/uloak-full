<?php

namespace Database\Factories;

use App\Models\PersonStoryLink;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonStoryLinkFactory extends Factory
{
    protected $model = PersonStoryLink::class;

    public function definition(): array
    {
        return [
            'role' => 'mentioned',
        ];
    }
}
