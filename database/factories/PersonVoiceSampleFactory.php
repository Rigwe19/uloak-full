<?php

namespace Database\Factories;

use App\Models\PersonVoiceSample;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonVoiceSampleFactory extends Factory
{
    protected $model = PersonVoiceSample::class;

    public function definition(): array
    {
        return [
            'is_consent_given' => true,
        ];
    }
}
