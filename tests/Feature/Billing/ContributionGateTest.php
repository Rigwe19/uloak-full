<?php

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('legacy room is always open', function () {
    $room = Room::factory()->legacy()->create(['created_by' => $this->user->id]);

    expect($room->isLegacy())->toBeTrue();
    expect($room->contributionsOpen())->toBeTrue();
    expect($room->contributionBlockReason())->toBeNull();
    expect($room->remainingStorageBytes())->toBeNull();
});

test('starter room is open when fresh', function () {
    $room = Room::factory()->starter()->create(['created_by' => $this->user->id]);

    expect($room->contributionsOpen())->toBeTrue();
    expect($room->contributionBlockReason())->toBeNull();
});

test('draft room blocks contributions', function () {
    $room = Room::factory()->starter()->draft()->create(['created_by' => $this->user->id]);

    expect($room->contributionsOpen())->toBeFalse();
    expect($room->contributionBlockReason())->toBe('draft');
});

test('expired starter blocks contributions', function () {
    $room = Room::factory()->starter()->create([
        'created_by' => $this->user->id,
        'expires_at' => now()->subDay(),
    ]);

    expect($room->contributionsOpen())->toBeFalse();
    expect($room->contributionBlockReason())->toBe('expired');
});

test('closed room blocks contributions', function () {
    $room = Room::factory()->starter()->create([
        'created_by' => $this->user->id,
        'contributions_closed_at' => now(),
    ]);

    expect($room->contributionsOpen())->toBeFalse();
    expect($room->contributionBlockReason())->toBe('closed');
});

test('storage-full room blocks contributions', function () {
    $room = Room::factory()->starter()->create([
        'created_by' => $this->user->id,
        'storage_used_bytes' => 1_073_741_824,
        'storage_limit_bytes' => 1_073_741_824,
    ]);

    expect($room->contributionsOpen())->toBeFalse();
    expect($room->contributionBlockReason())->toBe('storage_full');
});

test('guest middleware blocks contribution when room is expired', function () {
    $owner = User::factory()->create();
    $room = Room::factory()->starter()->create([
        'created_by' => $owner->id,
        'expires_at' => now()->subDay(),
    ]);

    $response = $this->postJson(route('share.rooms.stories.store', $room), [
        'title' => 'Test story',
    ]);

    $response->assertStatus(403);
    expect($response->json('reason'))->toBe('expired');
});

test('guest middleware allows contribution when room is open', function () {
    // Create an open starter room — the middleware checks contributionsOpen() before reaching controller.
    // The controller will then validate the story payload, but the gate should not block.
    $owner = User::factory()->create();
    $room = Room::factory()->starter()->create(['created_by' => $owner->id]);

    // Send minimal story data; middleware should pass (not 403). The controller may still return 422/500
    // depending on media, but it must not be 403 blocked by the gate.
    $response = $this->postJson(route('share.rooms.stories.store', $room), [
        'title' => 'Hello',
        'description' => 'A guest memory',
        'type' => 'text',
    ]);

    expect($response->status())->not->toBe(403);
});

test('storage tracking increments and decrements atomically', function () {
    $room = Room::factory()->starter()->create(['created_by' => $this->user->id, 'storage_used_bytes' => 0]);

    $room->addStorageBytes(500);
    $room->refresh();
    expect($room->storage_used_bytes)->toBe(500);

    $room->removeStorageBytes(200);
    $room->refresh();
    expect($room->storage_used_bytes)->toBe(300);

    $room->removeStorageBytes(9999);
    $room->refresh();
    expect($room->storage_used_bytes)->toBe(0);
});

test('close-expired-starters command closes only expired starters', function () {
    $expired = Room::factory()->starter()->create([
        'created_by' => $this->user->id,
        'expires_at' => now()->subDay(),
        'contributions_closed_at' => null,
    ]);
    $stillOpen = Room::factory()->starter()->create([
        'created_by' => $this->user->id,
        'expires_at' => now()->addDay(),
    ]);
    $fullRoom = Room::factory()->fullRoom()->create([
        'created_by' => $this->user->id,
        'expires_at' => now()->subDay(),
    ]);

    $this->artisan('rooms:close-expired-starters')->assertExitCode(0);

    $expired->refresh();
    $stillOpen->refresh();
    $fullRoom->refresh();

    expect($expired->contributions_closed_at)->not->toBeNull();
    expect($stillOpen->contributions_closed_at)->toBeNull();
    expect($fullRoom->contributions_closed_at)->toBeNull();
});
