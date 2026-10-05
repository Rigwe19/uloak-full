<?php

use App\Models\HouseMember;
use App\Models\Media;
use App\Models\Person;
use App\Models\Room;
use App\Models\RoomMember;
use App\Models\User;
use App\Services\RoomService;
use App\Services\StoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function peopleSetup(): array
{
    $owner = User::factory()->create();
    $ada = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);
    $ada->identity()->create(['legal_name' => 'Ada Adim', 'display_name' => 'Ada']);
    $chidi = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);
    $chidi->identity()->create(['legal_name' => 'Chidi Adim', 'display_name' => 'Chidi']);
    $eventRoom = Room::factory()->starter()->create(['created_by' => $owner->id]);

    return [$owner, $ada, $chidi, $eventRoom];
}

test('event room payload carries tagged people with person room slugs', function () {
    [$owner, $ada, $chidi, $eventRoom] = peopleSetup();
    $personRoom = app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Ada Adim',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $ada->id,
    ]);
    $this->actingAs($owner);

    app(StoryService::class)->createStory($owner, $eventRoom, [
        'title' => 'Group photo',
        'type' => 'photo',
        'person_ids' => [$ada->id, $chidi->id],
    ]);

    $this->get(route('dashboard.rooms.show', $eventRoom))->assertOk()->assertInertia(fn ($page) => $page
        ->component('dashboard/rooms/show')
        ->where('stories.0.tagged_people.0.display_name', 'Ada')
        ->where('stories.0.tagged_people.0.person_room_slug', $personRoom->slug)
        ->where('stories.0.tagged_people.1.display_name', 'Chidi')
        ->where('stories.0.tagged_people.1.person_room_slug', null)
    );
});

test('untagged stories carry an empty tagged people list', function () {
    [$owner, , , $eventRoom] = peopleSetup();
    $this->actingAs($owner);

    app(StoryService::class)->createStory($owner, $eventRoom, ['title' => 'Solo', 'type' => 'photo']);

    $this->get(route('dashboard.rooms.show', $eventRoom))->assertOk()->assertInertia(fn ($page) => $page
        ->where('stories.0.tagged_people', [])
    );
});

test('share payload carries tagged people for guests', function () {
    [$owner, $ada, , $eventRoom] = peopleSetup();
    $media = Media::factory()->image()->create(['status' => 'ready']);

    $this->post(route('share.rooms.stories.store', $eventRoom), [
        'guest_name' => 'Guest',
        'type' => 'photo',
        'media_uuids' => [$media->uuid],
        'person_ids' => [$ada->id],
    ])->assertRedirect();

    $this->get(route('share.rooms.show', $eventRoom->slug))->assertOk()->assertInertia(fn ($page) => $page
        ->where('stories.0.tagged_people.0.display_name', 'Ada')
    );
});

test('house payload carries tagged people', function () {
    [$owner, $ada, , $eventRoom] = peopleSetup();
    $member = HouseMember::create(['owner_id' => $owner->id, 'name' => 'Keeper', 'email' => 'keeper@example.com']);

    app(StoryService::class)->createStory($owner, $eventRoom, [
        'title' => 'Memory',
        'type' => 'photo',
        'person_ids' => [$ada->id],
    ]);

    $this->withSession(['house_owner_id' => $owner->id, 'house_member_id' => $member->id])
        ->get(route('house.rooms.show', $eventRoom))->assertOk()->assertInertia(fn ($page) => $page
        ->where('stories.0.tagged_people.0.display_name', 'Ada')
        );
});

test('family payload carries tagged people', function () {
    [$owner, $ada, , $eventRoom] = peopleSetup();
    $member = RoomMember::create(['room_id' => $eventRoom->id, 'name' => 'Kin', 'email' => 'kin@example.com']);

    app(StoryService::class)->createStory($owner, $eventRoom, [
        'title' => 'Memory',
        'type' => 'photo',
        'person_ids' => [$ada->id],
    ]);

    $this->withSession(['family_member_id' => $member->id])
        ->get(route('family.rooms.show', $eventRoom))->assertOk()->assertInertia(fn ($page) => $page
        ->where('stories.0.tagged_people.0.display_name', 'Ada')
        );
});

test('api resource carries tagged people', function () {
    [$owner, $ada, , $eventRoom] = peopleSetup();
    $this->actingAs($owner);

    app(StoryService::class)->createStory($owner, $eventRoom, [
        'title' => 'Memory',
        'type' => 'photo',
        'person_ids' => [$ada->id],
    ]);

    $this->getJson(route('api.v1.rooms.show', $eventRoom))
        ->assertOk()
        ->assertJsonPath('data.stories.0.tagged_people.0.display_name', 'Ada')
        ->assertJsonPath('data.stories.0.tagged_people.0.id', $ada->id);
});
