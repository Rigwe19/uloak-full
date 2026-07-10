<?php

namespace Database\Factories;

use App\Models\PersonLanguage;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonLanguageFactory extends Factory
{
    protected $model = PersonLanguage::class;

    public function definition(): array
    {
        return [
            'language' => fake()->languageCode(),
            'proficiency' => 'fluent',
        ];
    }
}
