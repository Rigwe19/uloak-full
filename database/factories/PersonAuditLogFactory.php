<?php

namespace Database\Factories;

use App\Models\PersonAuditLog;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonAuditLogFactory extends Factory
{
    protected $model = PersonAuditLog::class;

    public function definition(): array
    {
        return [
            'action' => 'created',
        ];
    }
}
