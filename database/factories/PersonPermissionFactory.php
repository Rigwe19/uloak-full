<?php

namespace Database\Factories;

use App\Models\PersonPermission;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonPermissionFactory extends Factory
{
    protected $model = PersonPermission::class;

    public function definition(): array
    {
        return [
            'grantee_type' => 'public',
            'ability' => 'view',
            'allowed' => true,
        ];
    }
}
