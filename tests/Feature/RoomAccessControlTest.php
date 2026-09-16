<?php

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->intruder = User::factory()->create();

    $this->room = Room::factory()->create([
        'created_by' => $this->user->id,
    ]);
});

test('the dashboard does not include rooms owned by other users', function () {
    $this->actingAs($this->intruder);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->where('dashboardData.rooms', [])
    );
});

test('the dashboard includes rooms owned by the user', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->where('dashboardData.rooms.0.id', $this->room->id)
    );
});

test('a user cannot view another users room', function () {
    $this->actingAs($this->intruder);

    $response = $this->get(route('dashboard.rooms.show', $this->room));

    $response->assertForbidden();
});

test('a user who is a room member can view the room', function () {
    $this->room->members()->attach($this->intruder->id);
    $this->actingAs($this->intruder);

    $response = $this->get(route('dashboard.rooms.show', $this->room));

    $response->assertOk();
});

test('the room owner can view the room', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('dashboard.rooms.show', $this->room));

    $response->assertOk();
});

test('a user cannot update another users room', function () {
    $this->actingAs($this->intruder);

    $response = $this->put(route('dashboard.rooms.update', $this->room), [
        'name' => 'Hijacked room name',
        'privacy' => 'private',
    ]);

    $response->assertForbidden();
});

test('a user cannot view another users room feed', function () {
    $this->actingAs($this->intruder);

    $response = $this->get(route('dashboard.rooms.feed', $this->room));

    $response->assertForbidden();
});

test('a guest cannot download another users room media', function () {
    $response = $this->get(route('rooms.download-media', $this->room));

    $response->assertForbidden();
});

test('an authenticated user cannot download another users room media', function () {
    $this->actingAs($this->intruder);

    $response = $this->get(route('rooms.download-media', $this->room));

    $response->assertForbidden();
});

test('the api rejects viewing another users room', function () {
    $this->actingAs($this->intruder);

    $response = $this->getJson('/api/v1/rooms/'.$this->room->slug);

    $response->assertForbidden();
});

test('the api rejects updating another users room', function () {
    $this->actingAs($this->intruder);

    $response = $this->putJson('/api/v1/rooms/'.$this->room->slug, [
        'name' => 'Hijacked API name',
        'privacy' => 'private',
    ]);

    $response->assertForbidden();
});

test('the api index only returns rooms owned by or shared with the user', function () {
    $this->actingAs($this->intruder);

    $response = $this->getJson('/api/v1/rooms');

    $response->assertOk();
    $ids = collect($response->json('data.data'))->pluck('id')->all();
    expect($ids)->not->toContain($this->room->id);
});
