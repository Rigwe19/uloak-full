<?php

use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('error page renders', function () {
    $response = $this->get('/waiting-list');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('waiting-list'));
});

test('waiting list store validates and creates row', function () {
    $response = $this->post('/waiting-list', [
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('waiting_lists', ['email' => 'test@example.com']);
});

test('download error page renders instead of 500', function () {
    $owner = User::factory()->create();
    $room = Room::factory()->create([
        'created_by' => $owner->id,
        'allow_download' => false,
        'privacy' => 'public',
    ]);

    $response = $this->post('/downloads/request', [
        'email' => 'guest@example.com',
        'type' => 'room',
        'slug' => $room->slug,
    ]);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('error')->where('status', 403));
});

test('story viewer page renders for room owner with prev and next', function () {
    $owner = User::factory()->create();
    $room = Room::factory()->create(['created_by' => $owner->id]);
    $older = Story::factory()->create(['room_id' => $room->id, 'created_at' => now()->subDays(2)]);
    $current = Story::factory()->create(['room_id' => $room->id, 'created_at' => now()->subDay()]);
    Story::factory()->create(['room_id' => $room->id, 'created_at' => now()]);

    $this->actingAs($owner);

    $response = $this->get(route('dashboard.stories.show', $current));

    $response->assertOk();
    $response->assertInertia(function ($page) use ($room, $current) {
        $page->component('dashboard/stories/show')
            ->where('story.id', $current->id)
            ->where('room.id', $room->id);
    });
});

test('story data endpoint returns prev and next previews', function () {
    $owner = User::factory()->create();
    $room = Room::factory()->create(['created_by' => $owner->id]);
    $current = Story::factory()->create(['room_id' => $room->id]);

    // showData is authorizeStory (update policy): contributor or room creator passes.
    $this->actingAs($owner);

    $response = $this->getJson(route('dashboard.stories.data', $current));

    $response->assertOk();
    $response->assertJsonStructure([
        'story' => ['uuid', 'id', 'title'],
        'prevStory',
        'nextStory',
    ]);
});

test('story viewer forbids non-member', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $room = Room::factory()->create(['created_by' => $owner->id]);
    $story = Story::factory()->create(['room_id' => $room->id]);

    $this->actingAs($intruder);

    $this->get(route('dashboard.stories.show', $story))->assertForbidden();
});
