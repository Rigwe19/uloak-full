<?php

use App\Models\Enquiry;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['is_admin' => true]);
    $this->actingAs($this->admin);
});

test('admin can toggle user admin status', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->patch(route('admin.users.toggle-admin', $user))->assertRedirect();

    expect($user->fresh()->is_admin)->toBeTrue();
});

test('admin cannot demote last admin or self', function () {
    $this->patch(route('admin.users.toggle-admin', $this->admin))
        ->assertSessionHasErrors('user');

    expect($this->admin->fresh()->is_admin)->toBeTrue();
});

test('admin can delete users and rooms and update enquiries', function () {
    $victim = User::factory()->create();
    $this->delete(route('admin.users.destroy', $victim))->assertRedirect();
    expect(User::find($victim->id))->toBeNull();

    $room = Room::factory()->create();
    $this->delete(route('admin.rooms.destroy', $room))->assertRedirect();
    expect(Room::find($room->id))->toBeNull();

    $enquiry = Enquiry::create(['name' => 'Test', 'email' => 't@example.com', 'subject' => 'Hi', 'message' => 'Hello', 'status' => 'new']);
    $this->patch(route('admin.enquiries.status', $enquiry), ['status' => 'read'])->assertRedirect();
    expect($enquiry->fresh()->status)->toBe('read');

    $this->delete(route('admin.enquiries.destroy', $enquiry))->assertRedirect();
    expect(Enquiry::find($enquiry->id))->toBeNull();
});

test('admin report downloads CSV', function () {
    $response = $this->get(route('admin.report'));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/csv');
});

test('non-admin cannot access admin actions', function () {
    $plain = User::factory()->create(['is_admin' => false]);
    $this->actingAs($plain);

    $victim = User::factory()->create();
    $this->patch(route('admin.users.toggle-admin', $victim))->assertForbidden();
    $this->delete(route('admin.users.destroy', $victim))->assertForbidden();
    $this->get(route('admin.report'))->assertForbidden();
});
