<?php

namespace Database\Factories;

use App\Models\PersonConsent;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonConsentFactory extends Factory
{
    protected $model = PersonConsent::class;

    public function definition(): array
    {
        return [
            'consent_type' => 'profile_visibility',
            'status' => 'granted',
            'version' => 1,
        ];
    }
}
