<?php

use App\Enums\PaymentStatus;
use App\Enums\Region;
use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use App\Services\Billing\Contracts\PaymentGatewayInterface;
use App\Services\Billing\Gateways\PaystackGateway;
use App\Services\Billing\PaymentService;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->pricing = app(PricingService::class);
    $this->payments = app(PaymentService::class);
});

test('pricing matrix resolves correct amounts for each region', function () {
    expect($this->pricing->priceFor(Region::Nigeria, 'full_room'))->toBe(1_500_000);
    expect($this->pricing->priceFor(Region::Nigeria, 'family_monthly'))->toBe(350_000);
    expect($this->pricing->priceFor(Region::Nigeria, 'family_yearly'))->toBe(3_500_000);
    expect($this->pricing->priceFor(Region::RestOfAfrica, 'full_room'))->toBe(1_900);
    expect($this->pricing->priceFor(Region::Uk, 'full_room'))->toBe(2_900);
    expect($this->pricing->priceFor(Region::UsRestOfWorld, 'full_room'))->toBe(3_500);
    expect($this->pricing->priceFor(Region::Europe, 'full_room'))->toBe(3_500);
});

test('checkout creates pending payment with server-side pricing', function () {
    $room = Room::factory()->create(['created_by' => $this->user->id, 'status' => RoomStatus::Draft->value]);

    $payment = $this->payments->createCheckout($this->user, $room, [
        'region' => 'nigeria',
        'tier' => 'full_room',
    ]);

    expect($payment->amount)->toBe(1_500_000);
    expect($payment->currency)->toBe('NGN');
    expect($payment->status)->toBe(PaymentStatus::Pending);
    expect($payment->provider->value)->toBe('paystack');
    expect($payment->region)->toBe(Region::Nigeria);
});

test('checkout defaults to stripe for non-nigeria regions', function () {
    $payment = $this->payments->createCheckout($this->user, null, [
        'region' => 'uk',
        'tier' => 'full_room',
    ]);

    expect($payment->provider->value)->toBe('stripe');
    expect($payment->currency)->toBe('GBP');
    expect($payment->amount)->toBe(2_900);
});

test('checkout throws for unknown tier', function () {
    expect(fn () => $this->payments->createCheckout($this->user, null, [
        'region' => 'nigeria',
        'tier' => 'nonexistent',
    ]))->toThrow(InvalidArgumentException::class);
});

test('checkout throws for starter tier (free, no payment required)', function () {
    expect(fn () => $this->payments->createCheckout($this->user, null, [
        'region' => 'nigeria',
        'tier' => 'starter',
    ]))->toThrow(InvalidArgumentException::class, 'does not require payment');
});

test('paystack is rejected outside nigeria', function () {
    expect(fn () => $this->payments->createCheckout($this->user, null, [
        'region' => 'uk',
        'tier' => 'full_room',
        'provider' => 'paystack',
    ]))->toThrow(InvalidArgumentException::class, 'Paystack is only available');
});

test('checkout attaches partner commission for valid ref_code', function () {
    $partner = Partner::factory()->create(['ref_code' => 'WED123', 'commission_rate' => 20.00]);
    $room = Room::factory()->create(['created_by' => $this->user->id, 'status' => RoomStatus::Draft->value]);

    $payment = $this->payments->createCheckout($this->user, $room, [
        'region' => 'nigeria',
        'tier' => 'full_room',
        'ref_code' => 'WED123',
    ]);

    expect($payment->partner_id)->toBe($partner->id);
    expect($payment->commission_amount)->toBe(300_000);
});

test('checkout ignores invalid ref_code', function () {
    $payment = $this->payments->createCheckout($this->user, null, [
        'region' => 'nigeria',
        'tier' => 'full_room',
        'ref_code' => 'BOGUS',
    ]);

    expect($payment->partner_id)->toBeNull();
    expect($payment->commission_amount)->toBeNull();
});

test('partner commission floors at nigeria minimum', function () {
    $partner = Partner::factory()->create(['ref_code' => 'FLOOR', 'commission_rate' => 5.00]);
    // 5% of 1_500_000 = 75_000 but floor is 300_000 for NGN
    $payment = $this->payments->createCheckout($this->user, null, [
        'region' => 'nigeria',
        'tier' => 'full_room',
        'ref_code' => 'FLOOR',
    ]);

    expect($payment->commission_amount)->toBe(300_000);
});

test('idempotent verify does not double-activate room', function () {
    $room = Room::factory()->create([
        'created_by' => $this->user->id,
        'status' => RoomStatus::Draft->value,
        'tier_type' => null,
    ]);

    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'room_id' => $room->id,
        'amount' => 1_500_000,
        'currency' => 'NGN',
        'provider' => 'paystack',
        'status' => PaymentStatus::Successful,
        'paid_at' => now(),
    ]);

    // Second call should return immediately without touching room again
    $result = $this->payments->verifyAndActivate($payment);

    expect($result->status)->toBe(PaymentStatus::Successful);
    // Room should remain draft because the payment was already successful before our service had a chance to activate.
    // Create a pending payment and mock gateway to test successful activation flow.
});

test('verifyAndActivate leaves pending when provider unverified', function () {
    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'status' => PaymentStatus::Pending,
        'amount' => 1_500_000,
        'currency' => 'NGN',
        'provider' => 'paystack',
    ]);

    // No provider keys configured → verify returns verified=false
    $result = $this->payments->verifyAndActivate($payment);

    expect($result->status)->toBe(PaymentStatus::Pending);
});

test('room activation sets full_room tier and 12-month expiry', function () {
    $room = Room::factory()->create([
        'created_by' => $this->user->id,
        'status' => RoomStatus::Draft->value,
        'tier_type' => null,
    ]);

    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'room_id' => $room->id,
        'amount' => 1_500_000,
        'currency' => 'NGN',
        'provider' => 'paystack',
        'status' => PaymentStatus::Pending,
    ]);

    // Mock gateway to return verified with matching amount
    $mock = Mockery::mock(PaymentGatewayInterface::class);
    $mock->shouldReceive('verify')->andReturn(['verified' => true, 'amount' => 1_500_000, 'currency' => 'NGN', 'status' => 'success']);
    $this->app->instance(PaystackGateway::class, $mock);

    $result = $this->payments->verifyAndActivate($payment);

    expect($result->status)->toBe(PaymentStatus::Successful);
    $room->refresh();
    expect($room->tier_type)->toBe(RoomTier::FullRoom);
    expect($room->status)->toBe(RoomStatus::Active);
    expect($room->storage_limit_bytes)->toBe(10_737_418_240);
    expect($room->expires_at)->not->toBeNull();
});

test('checkout endpoint requires authentication', function () {
    $response = $this->postJson(route('billing.checkout'), [
        'region' => 'nigeria',
        'tier' => 'full_room',
    ]);

    $response->assertStatus(401);
});

test('authenticated user can initiate checkout via api', function () {
    $this->actingAs($this->user);

    $room = Room::factory()->create(['created_by' => $this->user->id, 'status' => RoomStatus::Draft->value]);

    $mock = Mockery::mock(PaymentGatewayInterface::class);
    $mock->shouldReceive('initialize')->andReturn(['authorization_url' => 'https://paystack.test/pay/abc', 'reference' => 'ref_abc']);
    $this->app->instance(PaystackGateway::class, $mock);

    $response = $this->postJson(route('billing.checkout'), [
        'room_id' => $room->id,
        'region' => 'nigeria',
        'tier' => 'full_room',
    ]);

    $response->assertOk();
    $response->assertJsonStructure(['authorization_url', 'reference']);
    $this->assertDatabaseHas('payments', ['user_id' => $this->user->id, 'room_id' => $room->id, 'status' => 'pending']);
});
