<?php

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('a room can be created with room_type', function () {
    $this->actingAs($this->user);

    $room = Room::factory()->create([
        'created_by' => $this->user->id,
        'room_type' => 'birthday',
    ]);

    expect($room->room_type)->toBe('birthday');
});

test('a room can be created with tribute features enabled', function () {
    $this->actingAs($this->user);

    $room = Room::factory()->create([
        'created_by' => $this->user->id,
        'room_type' => 'burial',
        'enable_tributes' => true,
        'enable_condolence_attendance' => true,
        'enable_candle_lighting' => true,
    ]);

    expect($room->enable_tributes)->toBeTrue();
    expect($room->enable_condolence_attendance)->toBeTrue();
    expect($room->enable_candle_lighting)->toBeTrue();
});

test('a general room has tribute features disabled by default', function () {
    $this->actingAs($this->user);

    $room = Room::factory()->create([
        'created_by' => $this->user->id,
        'room_type' => 'general',
    ]);

    expect($room->enable_tributes)->toBeFalse();
    expect($room->enable_condolence_attendance)->toBeFalse();
    expect($room->enable_candle_lighting)->toBeFalse();
});

test('tribute features are cast as booleans', function () {
    $room = Room::factory()->create([
        'created_by' => $this->user->id,
        'enable_tributes' => 1,
        'enable_condolence_attendance' => 1,
        'enable_candle_lighting' => 1,
    ]);

    expect($room->enable_tributes)->toBeTrue();
    expect($room->enable_condolence_attendance)->toBeTrue();
    expect($room->enable_candle_lighting)->toBeTrue();
});

test('a room can be created via the store endpoint with tribute features', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('dashboard.rooms.store'), [
        'name' => 'Test Burial Room',
        'description' => 'A burial room test',
        'privacy' => 'public',
        'room_type' => 'general',
        'enable_tributes' => true,
        'enable_condolence_attendance' => true,
        'enable_candle_lighting' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('rooms', [
        'name' => 'Test Burial Room',
        'room_type' => 'general',
        'enable_tributes' => true,
        'enable_condolence_attendance' => true,
        'enable_candle_lighting' => true,
    ]);
});

test('a room created with birthday type can have tributes enabled', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('dashboard.rooms.store'), [
        'name' => 'Birthday Celebration',
        'description' => 'A birthday room',
        'privacy' => 'public',
        'room_type' => 'general',
        'enable_tributes' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('rooms', [
        'name' => 'Birthday Celebration',
        'room_type' => 'general',
        'enable_tributes' => true,
        'enable_condolence_attendance' => false,
        'enable_candle_lighting' => false,
    ]);
});
