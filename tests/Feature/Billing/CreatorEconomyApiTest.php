<?php

use App\Enums\RoomStatus;
use App\Enums\SubscriptionTier;
use App\Models\CreatorProfile;
use App\Models\Room;
use App\Models\Story;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\Contracts\PaymentGatewayInterface;
use App\Services\Billing\Gateways\PaystackGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('public creator page returns profile and normal stories without auth', function () {
    $profile = CreatorProfile::factory()->create(['ref_code' => 'APICREAT']);
    Story::factory()->create(['user_id' => $profile->user_id, 'visibility' => 'normal', 'title' => 'Public tale']);

    $response = $this->getJson('/api/v1/creators/APICREAT');

    $response->assertOk();
    $response->assertJsonPath('data.ref_code', 'APICREAT');
    $response->assertJsonStructure(['data' => ['creator_type', 'split_pct'], 'stories']);
});

test('authenticated user can become a creator via api', function () {
    $this->actingAs($this->user);

    $response = $this->postJson('/api/v1/creators', ['creator_type' => 'normal']);

    $response->assertCreated();
    $response->assertJsonStructure(['data' => ['ref_code', 'creator_type', 'split_pct']]);
    $this->assertDatabaseHas('creator_profiles', ['user_id' => $this->user->id]);
});

test('watch index requires viewer subscription', function () {
    $this->actingAs($this->user);

    $this->getJson('/api/v1/watch')->assertForbidden();

    Subscription::factory()->create([
        'user_id' => $this->user->id,
        'tier' => SubscriptionTier::ViewerMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);
    Story::factory()->create(['visibility' => 'normal', 'title' => 'Normal tale']);

    $response = $this->getJson('/api/v1/watch');

    $response->assertOk();
    $response->assertJsonPath('is_vip_viewer', false);
    $response->assertJsonStructure(['data', 'featured']);
});

test('watch index pushes featured vip stories for vip viewers', function () {
    $vip = User::factory()->create();
    Subscription::factory()->create([
        'user_id' => $vip->id,
        'tier' => SubscriptionTier::ViewerVipMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);
    Story::factory()->create(['visibility' => 'vip', 'title' => 'VIP tale']);

    $this->actingAs($vip);

    $response = $this->getJson('/api/v1/watch');

    $response->assertOk();
    $response->assertJsonPath('is_vip_viewer', true);
    expect($response->json('featured'))->toHaveCount(1);
});

test('watch featured is vip only via api', function () {
    Subscription::factory()->create([
        'user_id' => $this->user->id,
        'tier' => SubscriptionTier::ViewerMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);

    $this->actingAs($this->user);
    $this->getJson('/api/v1/watch/featured')->assertForbidden();

    $vip = User::factory()->create();
    Subscription::factory()->create([
        'user_id' => $vip->id,
        'tier' => SubscriptionTier::ViewerVipYearly,
        'status' => 'active',
        'current_period_end' => now()->addYear(),
    ]);

    $this->actingAs($vip);
    $this->getJson('/api/v1/watch/featured')->assertOk();
});

test('subscriptions index lists own subscriptions via api', function () {
    Subscription::factory()->count(2)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user);

    $response = $this->getJson('/api/v1/subscriptions');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);
});

test('subscriptions store creates viewer checkout with creator attribution via api', function () {
    $profile = CreatorProfile::factory()->create(['ref_code' => 'APILINK']);
    $this->actingAs($this->user);

    $mock = Mockery::mock(PaymentGatewayInterface::class);
    $mock->shouldReceive('initialize')->andReturn(['authorization_url' => 'https://paystack.test/pay/api', 'reference' => 'ref_api']);
    $this->app->instance(PaystackGateway::class, $mock);

    $response = $this->postJson('/api/v1/subscriptions', [
        'region' => 'nigeria',
        'tier' => 'viewer_vip_monthly',
        'ref_code' => 'APILINK',
    ]);

    $response->assertCreated();
    $response->assertJsonPath('data.creator_profile_id', $profile->id);
    $response->assertJsonPath('data.tier', 'viewer_vip_monthly');
});

test('subscription cancel via api sets cancel flag', function () {
    $sub = Subscription::factory()->create(['user_id' => $this->user->id]);
    $this->actingAs($this->user);

    $response = $this->postJson("/api/v1/subscriptions/{$sub->id}/cancel");

    $response->assertOk();
    expect($sub->refresh()->cancel_at_period_end)->toBeTrue();
});

test('story show is gated by viewer subscription via api', function () {
    $vipStory = Story::factory()->create(['visibility' => 'vip']);

    Subscription::factory()->create([
        'user_id' => $this->user->id,
        'tier' => SubscriptionTier::ViewerMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);

    $this->actingAs($this->user);
    $this->getJson("/api/v1/stories/{$vipStory->uuid}")->assertForbidden();

    $vipViewer = User::factory()->create();
    Subscription::factory()->create([
        'user_id' => $vipViewer->id,
        'tier' => SubscriptionTier::ViewerVipMonthly,
        'status' => 'active',
        'current_period_end' => now()->addMonth(),
    ]);

    $this->actingAs($vipViewer);
    $response = $this->getJson("/api/v1/stories/{$vipStory->uuid}");

    $response->assertOk();
    $response->assertJsonPath('data.visibility', 'vip');
});

test('normal creator cannot publish vip story via api', function () {
    $creator = User::factory()->create();
    CreatorProfile::factory()->create(['user_id' => $creator->id]);
    $room = Room::factory()->create(['created_by' => $creator->id, 'status' => RoomStatus::Active->value]);

    $this->actingAs($creator);

    $response = $this->postJson("/api/v1/rooms/{$room->slug}/stories", [
        'title' => 'Sneaky VIP',
        'type' => 'photo',
        'visibility' => 'vip',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('visibility');
});

test('pricing endpoint includes viewer tiers', function () {
    $response = $this->getJson('/api/v1/pricing');

    $response->assertOk();
    $response->assertJsonStructure(['data' => ['nigeria' => ['viewer_monthly', 'viewer_yearly', 'viewer_vip_monthly', 'viewer_vip_yearly']]]);
});
