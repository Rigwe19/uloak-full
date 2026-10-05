<?php

use App\Models\Person;
use App\Models\PersonPermission;
use App\Models\Room;
use App\Models\User;
use App\Services\PersonScope;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function taggableSetup(): array
{
    $owner = User::factory()->create();
    $zara = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);
    $zara->identity()->create(['legal_name' => 'Zara Adim', 'display_name' => 'Zara']);
    $ada = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);
    $ada->identity()->create(['legal_name' => 'Ada Adim', 'display_name' => 'Ada']);
    $room = Room::factory()->starter()->create(['created_by' => $owner->id]);

    return [$owner, $room];
}

test('taggable list returns own people sorted with only safe keys', function () {
    [$owner] = taggableSetup();

    $list = app(PersonScope::class)->taggableFor($owner);

    expect(array_column($list, 'display_name'))->toBe(['Ada', 'Zara']);
    foreach ($list as $entry) {
        expect(array_keys($entry))->toBe(['id', 'uuid', 'display_name']);
    }
});

test('taggable list excludes other families but includes edit grants', function () {
    [$owner] = taggableSetup();
    $stranger = User::factory()->create();
    $strangerPerson = Person::factory()->create(['user_id' => $stranger->id, 'created_by' => $stranger->id]);
    $strangerPerson->identity()->create(['legal_name' => 'Stranger', 'display_name' => 'Stranger']);

    $ids = array_column(app(PersonScope::class)->taggableFor($owner), 'id');
    expect($ids)->not->toContain($strangerPerson->id);

    PersonPermission::create([
        'person_id' => $strangerPerson->id,
        'grantee_type' => 'user',
        'grantee_id' => $owner->id,
        'ability' => 'edit',
        'allowed' => true,
    ]);

    $ids = array_column(app(PersonScope::class)->taggableFor($owner), 'id');
    expect($ids)->toContain($strangerPerson->id);
});

test('taggable list for a room uses the room creator scope', function () {
    [$owner, $room] = taggableSetup();

    $list = app(PersonScope::class)->taggableForRoom($room);

    expect(array_column($list, 'display_name'))->toBe(['Ada', 'Zara']);
});

test('dashboard room page exposes taggable people for the picker', function () {
    [$owner, $room] = taggableSetup();
    $this->actingAs($owner);

    $this->get(route('dashboard.rooms.show', $room))->assertOk()->assertInertia(fn ($page) => $page
        ->component('dashboard/rooms/show')
        ->has('taggablePeople', 2)
        ->where('taggablePeople.0.display_name', 'Ada')
    );
});

test('share page exposes taggable people for guest tagging', function () {
    [, $room] = taggableSetup();

    $this->get(route('share.rooms.show', $room->slug))->assertOk()->assertInertia(fn ($page) => $page
        ->has('taggablePeople', 2)
    );
});
