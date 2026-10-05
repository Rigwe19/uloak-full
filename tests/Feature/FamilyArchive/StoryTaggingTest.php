<?php

use App\Models\Event;
use App\Models\HouseMember;
use App\Models\Media;
use App\Models\Person;
use App\Models\PersonStoryLink;
use App\Models\Room;
use App\Models\RoomMember;
use App\Models\Story;
use App\Models\User;
use App\Services\StoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function taggingOwnerWithPeople(int $count = 2): array
{
    $owner = User::factory()->create();
    $people = Person::factory()->count($count)->create([
        'user_id' => $owner->id,
        'created_by' => $owner->id,
    ]);
    $room = Room::factory()->starter()->create(['created_by' => $owner->id]);

    return [$owner, $people, $room];
}

test('dashboard story store accepts person_ids and creates links', function () {
    [$owner, $people, $room] = taggingOwnerWithPeople();
    $this->actingAs($owner);

    $this->post(route('dashboard.rooms.stories.store', $room), [
        'title' => 'Tagged memory',
        'type' => 'photo',
        'person_ids' => $people->pluck('id')->all(),
    ])->assertRedirect();

    $story = Story::where('room_id', $room->id)->firstOrFail();
    expect($story->taggedPeople->pluck('id')->sort()->values()->all())
        ->toBe($people->pluck('id')->sort()->values()->all());
    expect(PersonStoryLink::where('story_id', $story->id)->count())->toBe(2);
});

test('story without person_ids creates no links', function () {
    [$owner, , $room] = taggingOwnerWithPeople();
    $this->actingAs($owner);

    $this->post(route('dashboard.rooms.stories.store', $room), [
        'title' => 'Untagged memory',
        'type' => 'photo',
    ])->assertRedirect();

    $story = Story::where('room_id', $room->id)->firstOrFail();
    expect(PersonStoryLink::where('story_id', $story->id)->count())->toBe(0);
});

test('nonexistent person ids are rejected by validation', function () {
    [$owner, , $room] = taggingOwnerWithPeople();
    $this->actingAs($owner);

    $this->post(route('dashboard.rooms.stories.store', $room), [
        'title' => 'Bad tag',
        'type' => 'photo',
        'person_ids' => [999999],
    ])->assertSessionHasErrors('person_ids.0');

    expect(Story::where('room_id', $room->id)->count())->toBe(0);
});

test('out-of-scope person ids are rejected and no story is created', function () {
    [$owner, $people, $room] = taggingOwnerWithPeople();
    $stranger = User::factory()->create();
    $strangerPerson = Person::factory()->create(['user_id' => $stranger->id, 'created_by' => $stranger->id]);
    $this->actingAs($owner);

    $this->post(route('dashboard.rooms.stories.store', $room), [
        'title' => 'Stranger tag',
        'type' => 'photo',
        'person_ids' => [$people->first()->id, $strangerPerson->id],
    ])->assertSessionHasErrors('person_ids');

    expect(Story::where('room_id', $room->id)->count())->toBe(0);
    expect(PersonStoryLink::where('person_id', $strangerPerson->id)->count())->toBe(0);
});

test('sync replaces links on update and empty array clears them', function () {
    [$owner, $people, $room] = taggingOwnerWithPeople();
    $svc = app(StoryService::class);

    $story = $svc->createStory($owner, $room, [
        'title' => 'Memory',
        'type' => 'photo',
        'person_ids' => [$people[0]->id, $people[1]->id],
    ]);
    expect($story->taggedPeople()->count())->toBe(2);

    // Narrow to one person: the other link is removed, no duplicate created.
    $svc->syncTaggedPeople($story, $owner, [$people[0]->id]);
    expect($story->taggedPeople()->pluck('people.id')->all())->toBe([$people[0]->id]);

    // Re-syncing the same set is idempotent.
    $svc->syncTaggedPeople($story, $owner, [$people[0]->id]);
    expect(PersonStoryLink::where('story_id', $story->id)->count())->toBe(1);

    // Empty array clears all links; null leaves them unchanged.
    $svc->syncTaggedPeople($story, $owner, []);
    expect(PersonStoryLink::where('story_id', $story->id)->count())->toBe(0);

    $svc->syncTaggedPeople($story, $owner, [$people[1]->id]);
    $svc->syncTaggedPeople($story, $owner, null);
    expect(PersonStoryLink::where('story_id', $story->id)->count())->toBe(1);
});

test('house story store tags people in the owner scope', function () {
    [$owner, $people, $room] = taggingOwnerWithPeople();
    $member = HouseMember::create(['owner_id' => $owner->id, 'name' => 'Keeper', 'email' => 'keeper@example.com']);

    $this->withSession(['house_owner_id' => $owner->id, 'house_member_id' => $member->id])
        ->post(route('house.rooms.stories.store', $room), [
            'title' => 'House memory',
            'type' => 'photo',
            'person_ids' => [$people->first()->id],
        ])->assertRedirect();

    $story = Story::where('room_id', $room->id)->firstOrFail();
    expect($story->taggedPeople()->pluck('people.id')->all())->toBe([$people->first()->id]);
});

test('guest share contribution tags people', function () {
    [$owner, $people, $room] = taggingOwnerWithPeople();
    $media = Media::factory()->image()->create(['status' => 'ready']);

    $this->post(route('share.rooms.stories.store', $room), [
        'guest_name' => 'Guest',
        'type' => 'photo',
        'media_uuids' => [$media->uuid],
        'person_ids' => $people->pluck('id')->all(),
    ])->assertRedirect();

    $story = Story::where('room_id', $room->id)->firstOrFail();
    expect($story->taggedPeople()->count())->toBe(2);
    expect($story->tags)->toBe(['guest-contribution']);
});

test('guest share with out-of-scope person creates no story', function () {
    [$owner, , $room] = taggingOwnerWithPeople();
    $stranger = User::factory()->create();
    $strangerPerson = Person::factory()->create(['user_id' => $stranger->id, 'created_by' => $stranger->id]);
    $media = Media::factory()->image()->create(['status' => 'ready']);

    $this->post(route('share.rooms.stories.store', $room), [
        'guest_name' => 'Guest',
        'type' => 'photo',
        'media_uuids' => [$media->uuid],
        'person_ids' => [$strangerPerson->id],
    ])->assertSessionHasErrors('person_ids');

    expect(Story::where('room_id', $room->id)->count())->toBe(0);
});

test('family contribution tags people', function () {
    [$owner, $people, $room] = taggingOwnerWithPeople();
    $member = RoomMember::create(['room_id' => $room->id, 'name' => 'Kin', 'email' => 'kin@example.com']);
    $media = Media::factory()->image()->create(['status' => 'ready']);

    $this->withSession(['family_member_id' => $member->id])
        ->post(route('family.rooms.stories.store', $room), [
            'type' => 'photo',
            'media_uuids' => [$media->uuid],
            'person_ids' => [$people->first()->id],
        ])->assertRedirect();

    $story = Story::where('room_id', $room->id)->firstOrFail();
    expect($story->taggedPeople()->pluck('people.id')->all())->toBe([$people->first()->id]);
    expect($story->tags)->toBe(['family-contribution']);
});

test('api story store tags people and keeps free-form tags', function () {
    [$owner, $people, $room] = taggingOwnerWithPeople();
    $this->actingAs($owner);

    $this->postJson(route('api.v1.rooms.stories.store', $room), [
        'title' => 'API memory',
        'type' => 'photo',
        'tags' => ['wedding-day'],
        'person_ids' => [$people->first()->id],
    ])->assertCreated();

    $story = Story::where('room_id', $room->id)->firstOrFail();
    expect($story->tags)->toBe(['wedding-day']);
    expect($story->taggedPeople()->pluck('people.id')->all())->toBe([$people->first()->id]);
});

test('event story store tags people', function () {
    [$owner, $people] = taggingOwnerWithPeople();
    $event = Event::factory()->create(['created_by' => $owner->id]);
    $this->actingAs($owner);

    $this->post(route('dashboard.events.stories.store', $event), [
        'title' => 'Event memory',
        'type' => 'photo',
        'person_ids' => [$people->first()->id],
    ])->assertRedirect();

    $story = Story::where('event_id', $event->id)->firstOrFail();
    expect($story->taggedPeople()->pluck('people.id')->all())->toBe([$people->first()->id]);
});
