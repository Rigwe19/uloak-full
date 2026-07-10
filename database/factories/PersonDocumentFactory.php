<?php

namespace Database\Factories;

use App\Models\PersonDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonDocumentFactory extends Factory
{
    protected $model = PersonDocument::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'document_type' => 'other',
            'visibility' => 'private',
        ];
    }
}
