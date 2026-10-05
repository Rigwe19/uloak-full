<?php

use App\Enums\PaymentStatus;
use App\Enums\Region;
use App\Enums\RoomStatus;
use App\Enums\SubscriptionTier;
use App\Models\CreatorEarning;
use App\Models\CreatorProfile;
use App\Models\Payment;
use App\Models\Room;
use App\Models\Story;
use App\Models\Subscription;
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

test('viewer pricing resolves for each region', function () {
    expect($this->pricing->priceFor(Region::Nigeria, 'viewer_monthly'))->toBe(200_000);
    expect($this->pricing->priceFor(Region::Nigeria, 'viewer_vip_monthly'))->toBe(350_000);
    expect($this->pricing->checkoutPrice(Region::Nigeria, 'viewer_monthly'))->toBe(['amount' => 200_000, 'currency' => 'NGN']);
    expect($this->pricing->checkoutPrice(Region::Uk, 'viewer_vip_yearly'))->toBe(['amount' => 7_900, 'currency' => 'GBP']);
});

test('checkout attaches creator profile for valid creator ref code', function () {
    $profile = CreatorProfile::factory()->create(['ref_code' => 'CREATOR1']);

    $payment = $this->payments->createCheckout($this->user, null, [
        'region' => 'nigeria',
        'tier' => 'viewer_monthly',
        'ref_code' => 'CREATOR1',
    ]);

    expect($payment->tier)->toBe('viewer_monthly');
    expect($payment->creator_profile_id)->toBe($profile->id);
    expect($payment->amount)->toBe(200_000);
});

test('verify creates viewer subscription and accrues normal creator earning', function () {
    $profile = CreatorProfile::factory()->create(['ref_code' => 'NORM1']);

    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'room_id' => null,
        'tier' => 'viewer_monthly',
        'amount' => 200_000,
        'currency' => 'NGN',
        'provider' => 'paystack',
        'status' => PaymentStatus::Pending,
        'creator_profile_id' => $profile->id,
    ]);

    $mock = Mockery::mock(PaymentGatewayInterface::class);
    $mock->shouldReceive('verify')->andReturn(['verified' => true, 'amount' => 200_000, 'currency' => 'NGN', 'status' => 'success']);
    $this->app->instance(PaystackGateway::class, $mock);

    $result = $this->payments->verifyAndActivate($payment);

    expect($result->status)->toBe(PaymentStatus::Successful);
    expect($result->subscription_id)->not->toBeNull();

    $this->assertDatabaseHas('subscriptions', [
        'id' => $result->subscription_id,
        'user_id' => $this->user->id,
        'tier' => SubscriptionTier::ViewerMonthly->value,
        'referred_creator_profile_id' => $profile->id,
    ]);

    // Normal split 70% of 200_000 = 140_000
    $this->assertDatabaseHas('creator_earnings', [
        'payment_id' => $payment->id,
        'creator_profile_id' => $profile->id,
        'amount_minor' => 140_000,
        'status' => 'pending',
    ]);
});

test('vip creator earns vip split', function () {
    $profile = CreatorProfile::factory()->vip()->create(['ref_code' => 'VIP1']);

    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'room_id' => null,
        'tier' => 'viewer_vip_monthly',
        'amount' => 350_000,
        'currency' => 'NGN',
        'provider' => 'paystack',
        'status' => PaymentStatus::Pending,
        'creator_profile_id' => $profile->id,
    ]);

    $mock = Mockery::mock(PaymentGatewayInterface::class);
    $mock->shouldReceive('verify')->andReturn(['verified' => true, 'amount' => 350_000, 'currency' => 'NGN', 'status' => 'success']);
    $this->app->instance(PaystackGateway::class, $mock);

    $this->payments->verifyAndActivate($payment);

    // VIP split 80% of 350_000 = 280_000
    $this->assertDatabaseHas('creator_earnings', [
        'payment_id' => $payment->id,
        'amount_minor' => 280_000,
    ]);
});

test('verify is idempotent for subscription and earning', function () {
    $profile = CreatorProfile::factory()->create();

    $payment = Payment::factory()->create([
        'user_id' => $this->user->id,
        'room_id' => null,
        'tier' => 'viewer_monthly',
        'amount' => 200_000,
        'currency' => 'NGN',
        'provider' => 'paystack',
        'status' => PaymentStatus::Pending,
        'creator_profile_id' => $profile->id,
    ]);

    $mock = Mockery::mock(PaymentGatewayInterface::class);
    $mock->shouldReceive('verify')->andReturn(['verified' => true, 'amount' => 200_000, 'currency' => 'NGN', 'status' => 'success']);
    $this->app->instance(PaystackGateway::class, $mock);

    $first = $this->payments->verifyAndActivate($payment);
    $second = $this->payments->verifyAndActivate($first->refresh());

    expect($second->subscription_id)->toBe($first->subscription_id);
    expect(CreatorEarning::where('payment_id', $payment->id)->count())->toBe(1);
    expect(Subscription::where('user_id', $this->user->id)->count())->toBe(1);
});

test('standard viewer can watch normal but not vip stories', function () {
    $viewer = User::factory()->create();
    Subscription::factory()->create([
        'user_id' => $viewer->id,
        'tier' => SubscriptionTier::ViewerMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);

    $normal = Story::factory()->create(['visibility' => 'normal']);
    $vip = Story::factory()->create(['visibility' => 'vip']);

    expect($viewer->canWatchNormalStories())->toBeTrue();
    expect($viewer->canWatchVipStories())->toBeFalse();
    expect($viewer->can('view', $normal))->toBeTrue();
    expect($viewer->can('view', $vip))->toBeFalse();
});

test('vip viewer can watch vip stories', function () {
    $viewer = User::factory()->create();
    Subscription::factory()->create([
        'user_id' => $viewer->id,
        'tier' => SubscriptionTier::ViewerVipMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);

    $vip = Story::factory()->create(['visibility' => 'vip']);

    expect($viewer->canWatchVipStories())->toBeTrue();
    expect($viewer->can('view', $vip))->toBeTrue();
});

test('guest without subscription cannot watch', function () {
    $guest = User::factory()->create();
    $normal = Story::factory()->create(['visibility' => 'normal']);

    expect($guest->can('view', $normal))->toBeFalse();
});

test('normal creator cannot publish vip story', function () {
    $creator = User::factory()->create();
    CreatorProfile::factory()->create(['user_id' => $creator->id]);
    $room = Room::factory()->create(['created_by' => $creator->id, 'status' => RoomStatus::Active->value]);

    $this->actingAs($creator);

    $response = $this->post(route('dashboard.rooms.stories.store', $room), [
        'title' => 'Secret VIP',
        'type' => 'photo',
        'visibility' => 'vip',
    ]);

    $response->assertSessionHasErrors('visibility');
});

test('watch featured requires vip subscription', function () {
    $standard = User::factory()->create();
    Subscription::factory()->create([
        'user_id' => $standard->id,
        'tier' => SubscriptionTier::ViewerMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);

    $this->actingAs($standard);
    $this->get(route('watch.featured'))->assertForbidden();

    $vip = User::factory()->create();
    Subscription::factory()->create([
        'user_id' => $vip->id,
        'tier' => SubscriptionTier::ViewerVipMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);

    $this->actingAs($vip);
    $this->get(route('watch.featured'))->assertOk();
});

test('subscription endpoint accepts viewer tiers with creator ref', function () {
    $profile = CreatorProfile::factory()->create(['ref_code' => 'LINK1']);
    $this->actingAs($this->user);

    $mock = Mockery::mock(PaymentGatewayInterface::class);
    $mock->shouldReceive('initialize')->andReturn(['authorization_url' => 'https://paystack.test/pay/x', 'reference' => 'ref_x']);
    $this->app->instance(PaystackGateway::class, $mock);

    $response = $this->postJson(route('billing.subscriptions.store'), [
        'region' => 'nigeria',
        'tier' => 'viewer_monthly',
        'ref_code' => 'LINK1',
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('payments', [
        'user_id' => $this->user->id,
        'tier' => 'viewer_monthly',
        'creator_profile_id' => $profile->id,
    ]);
});
