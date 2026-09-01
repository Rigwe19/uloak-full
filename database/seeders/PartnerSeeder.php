<?php

namespace Database\Seeders;

use App\Models\Partner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PartnerSeeder extends Seeder
{
    public function run(): void
    {
        $partners = [
            ['name' => 'Ulo Demo Wedding Planner', 'ref_code' => 'DEMOPLAN'],
            ['name' => 'Ulo Studio Partner', 'ref_code' => 'ULOSTUDIO'],
        ];

        foreach ($partners as $partner) {
            Partner::updateOrCreate(
                ['ref_code' => $partner['ref_code']],
                [
                    'name' => $partner['name'],
                    'contact_email' => Str::slug($partner['name']).'@uloofstories.com',
                    'commission_rate' => config('pricing.partner.commission_rate'),
                    'is_active' => true,
                ]
            );
        }
    }
}
