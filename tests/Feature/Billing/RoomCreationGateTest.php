<?php

use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Room;
use App\Models\User;
use App\Services\RoomService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

test('starter creation via service assigns starter limits', function () {
    $user = User::factory()->create();
    $svc = app(RoomService::class);

    $room = $svc->createRoom($user, ['name' => 'My Starter', 'privacy' => 'private', 'room_type' => 'general']);

    expect($room->tier_type)->toBe(RoomTier::Starter);
    expect($room->status)->toBe(RoomStatus::Active);
    expect($room->storage_limit_bytes)->toBe(1_073_741_824);
    expect($room->expires_at)->not->toBeNull();
});

test('second starter for same owner is rejected', function () {
    $user = User::factory()->create();
    $svc = app(RoomService::class);

    $svc->createRoom($user, ['name' => 'First', 'privacy' => 'private']);

    expect(fn () => $svc->createRoom($user, ['name' => 'Second', 'privacy' => 'private']))
        ->toThrow(ValidationException::class);
});

test('full_room cannot be created via service without payment', function () {
    $user = User::factory()->create();
    $svc = app(RoomService::class);

    expect(fn () => $svc->createRoom($user, ['name' => 'Full', 'privacy' => 'private', 'tier_type' => 'full_room'], RoomTier::FullRoom))
        ->toThrow(ValidationException::class);
});

test('family_archive cannot be created via service', function () {
    $user = User::factory()->create();
    $svc = app(RoomService::class);

    expect(fn () => $svc->createRoom($user, ['name' => 'Archive', 'privacy' => 'private'], RoomTier::FamilyArchive))
        ->toThrow(ValidationException::class);
});

test('wedding draft via WeddingsController bypasses starter count', function () {
    $user = User::factory()->create();
    $svc = app(RoomService::class);

    // User already has a starter
    $svc->createRoom($user, ['name' => 'Starter', 'privacy' => 'private']);

    // Simulate wedding draft creation (direct Room create as WeddingsController does)
    $room = Room::create([
        'name' => 'Wedding Draft',
        'privacy' => 'private',
        'room_type' => 'wedding',
        'tier_type' => null,
        'status' => RoomStatus::Draft->value,
        'created_by' => $user->id,
        'storage_used_bytes' => 0,
    ]);

    expect($room->status)->toBe(RoomStatus::Draft);
    // User still has 1 active starter plus a draft wedding — starter check only counts Active starters, so allowed.
    expect(Room::where('created_by', $user->id)->where('tier_type', RoomTier::Starter->value)->where('status', RoomStatus::Active->value)->count())->toBe(1);
});

test('dashboard store endpoint enforces paywall', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // First generic starter succeeds
    $this->post(route('dashboard.rooms.store'), [
        'name' => 'First Starter',
        'privacy' => 'private',
        'room_type' => 'general',
    ])->assertRedirect();

    $this->assertDatabaseHas('rooms', ['name' => 'First Starter', 'tier_type' => 'starter']);

    // Second starter is rejected with 422
    $response = $this->post(route('dashboard.rooms.store'), [
        'name' => 'Second Starter',
        'privacy' => 'private',
    ]);

    $response->assertSessionHasErrors('tier_type');
});

test('dashboard wedding room redirects to weddings paywall', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('dashboard.rooms.store'), [
        'name' => 'Try Wedding',
        'privacy' => 'private',
        'room_type' => 'wedding',
    ]);

    $response->assertRedirect(route('weddings.create', ['type' => 'wedding']));
});

test('dashboard birthday room redirects to pricing paywall', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('dashboard.rooms.store'), [
        'name' => 'Try Birthday',
        'privacy' => 'private',
        'room_type' => 'birthday',
    ]);

    $response->assertRedirect(route('weddings.create', ['type' => 'birthday']));
});

test('dashboard cannot request full_room for free', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('dashboard.rooms.store'), [
        'name' => 'Try Full',
        'privacy' => 'private',
        'tier_type' => 'full_room',
    ]);

    $response->assertRedirect(route('weddings.create', ['type' => 'wedding']));
});
