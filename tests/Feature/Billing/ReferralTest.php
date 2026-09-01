<?php

use App\Models\Partner;
use App\Models\User;
use App\Services\Billing\PaymentService;
use Database\Seeders\PartnerSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('partner commission calculates 20 percent with nigeria floor', function () {
    $partner = Partner::factory()->create(['commission_rate' => 20.00]);

    // 20% of ₦15,000 (1_500_000 minor) = 300_000
    expect($partner->calculateCommission(1_500_000, 'NGN'))->toBe(300_000);

    // Low rate 5% would be 75_000 but floor pushes to 300_000
    $low = Partner::factory()->create(['commission_rate' => 5.00]);
    expect($low->calculateCommission(1_500_000, 'NGN'))->toBe(300_000);

    // Non-NGN has no floor
    expect($partner->calculateCommission(1_900, 'USD'))->toBe(380);

    // USD low rate not floored
    expect($low->calculateCommission(1_900, 'USD'))->toBe(95);
});

test('track-referral middleware captures ref_code to session and cookie', function () {
    $partner = Partner::factory()->create(['ref_code' => 'VENDOR1', 'is_active' => true]);

    $response = $this->get('/weddings?ref=VENDOR1&utm_source=instagram&utm_medium=social');

    $response->assertOk();
    expect(session('referral_code'))->toBe('VENDOR1');
    expect(session('utm')['utm_source'])->toBe('instagram');
    $response->assertCookie('ulo_ref', 'VENDOR1');
});

test('partner seeder creates expected demo partners', function () {
    $this->seed(PartnerSeeder::class);

    $this->assertDatabaseHas('partners', ['ref_code' => 'DEMOPLAN']);
    $this->assertDatabaseHas('partners', ['ref_code' => 'ULOSTUDIO']);
});

test('inactive partner is not attached to payment', function () {
    $inactive = Partner::factory()->create(['ref_code' => 'DEAD', 'is_active' => false]);
    $user = User::factory()->create();

    $payment = app(PaymentService::class)->createCheckout($user, null, [
        'region' => 'nigeria',
        'tier' => 'full_room',
        'ref_code' => 'DEAD',
    ]);

    expect($payment->partner_id)->toBeNull();
});
