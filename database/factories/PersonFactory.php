<?php

namespace Database\Factories;

use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PersonFactory extends Factory
{
    protected $model = Person::class;

    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'type' => 'family_member',
            'living_status' => 'living',
            'is_featured' => false,
        ];
    }

    public function deceased(): static
    {
        return $this->state(fn () => [
            'living_status' => 'deceased',
        ]);
    }

    public function memorial(): static
    {
        return $this->state(fn () => [
            'type' => 'memorial',
            'living_status' => 'deceased',
        ]);
    }

    public function child(): static
    {
        return $this->state(fn () => [
            'type' => 'child',
            'living_status' => 'living',
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn () => [
            'is_featured' => true,
        ]);
    }
}
