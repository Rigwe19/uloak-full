<?php

namespace Database\Factories;

use App\Models\PersonStatistic;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonStatisticFactory extends Factory
{
    protected $model = PersonStatistic::class;

    public function definition(): array
    {
        return [
            'metric' => 'stories',
            'value' => 0,
            'period' => 'total',
        ];
    }
}
