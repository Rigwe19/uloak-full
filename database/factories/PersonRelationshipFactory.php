<?php

namespace Database\Factories;

use App\Models\PersonRelationship;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonRelationshipFactory extends Factory
{
    protected $model = PersonRelationship::class;

    public function definition(): array
    {
        return [
            'relationship_type' => 'is_known',
            'kind' => 'biological',
            'status' => 'active',
            'confidence' => 100,
        ];
    }
}
