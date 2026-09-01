<?php

use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Room;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = app(PaymentService::class);
});

test('move to archive requires active subscription', function () {
    $room = Room::factory()->fullRoom()->create(['created_by' => $this->user->id]);

    expect(fn () => $this->service->moveRoomToArchive($room, $this->user))
        ->toThrow(RuntimeException::class, 'active Family Archive');
});

test('move to archive requires ownership', function () {
    $other = User::factory()->create();
    $room = Room::factory()->fullRoom()->create(['created_by' => $other->id]);

    Subscription::factory()->create(['user_id' => $this->user->id, 'status' => 'active']);

    expect(fn () => $this->service->moveRoomToArchive($room, $this->user))
        ->toThrow(RuntimeException::class, 'Only the room owner');
});

test('move to archive upgrades room to family_archive', function () {
    Subscription::factory()->create(['user_id' => $this->user->id, 'status' => 'active']);
    $room = Room::factory()->fullRoom()->create(['created_by' => $this->user->id]);

    $this->service->moveRoomToArchive($room, $this->user);

    $room->refresh();
    expect($room->tier_type)->toBe(RoomTier::FamilyArchive);
    expect($room->status)->toBe(RoomStatus::Active);
    expect($room->storage_limit_bytes)->toBe(26_843_545_600);
});

test('subscription can be canceled at period end via endpoint', function () {
    $sub = Subscription::factory()->create(['user_id' => $this->user->id]);
    $this->actingAs($this->user);

    $response = $this->postJson(route('billing.subscriptions.cancel', $sub));

    $response->assertOk();
    $sub->refresh();
    expect($sub->cancel_at_period_end)->toBeTrue();
});

test('non-owner cannot cancel subscription', function () {
    $other = User::factory()->create();
    $sub = Subscription::factory()->create(['user_id' => $other->id]);
    $this->actingAs($this->user);

    $response = $this->postJson(route('billing.subscriptions.cancel', $sub));

    $response->assertStatus(404);
});

test('user can list own subscriptions', function () {
    Subscription::factory()->count(2)->create(['user_id' => $this->user->id]);
    $this->actingAs($this->user);

    $response = $this->getJson(route('billing.subscriptions.index'));

    $response->assertOk();
    expect($response->json('subscriptions'))->toHaveCount(2);
});

test('move room endpoint requires subscription', function () {
    $room = Room::factory()->fullRoom()->create(['created_by' => $this->user->id]);
    $this->actingAs($this->user);

    $response = $this->postJson(route('billing.rooms.move-to-archive', $room));

    $response->assertStatus(422);
});
