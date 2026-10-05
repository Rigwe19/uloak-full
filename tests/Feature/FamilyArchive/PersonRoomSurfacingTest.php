<?php

use App\Models\Person;
use App\Models\PersonStoryLink;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use App\Services\PersonArchiveService;
use App\Services\RoomService;
use App\Services\StoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function surfacingSetup(): array
{
    $owner = User::factory()->create();
    $people = Person::factory()->count(3)->create([
        'user_id' => $owner->id,
        'created_by' => $owner->id,
    ]);
    $roomSvc = app(RoomService::class);
    $personRooms = [];
    foreach ($people as $person) {
        $personRooms[$person->id] = $roomSvc->createRoom($owner, [
            'name' => "[Person] {$person->id}",
            'privacy' => 'private',
            'kind' => 'person',
            'person_id' => $person->id,
        ]);
    }
    $eventRoom = Room::factory()->starter()->create(['created_by' => $owner->id]);

    return [$owner, $people, $personRooms, $eventRoom];
}

test('tagged story appears in the person archive and stays in its event room', function () {
    [$owner, $people, $personRooms, $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $archive = app(PersonArchiveService::class);

    $story = $storySvc->createStory($owner, $eventRoom, [
        'title' => 'Wedding photo',
        'type' => 'photo',
        'person_ids' => [$people[0]->id],
    ]);

    // Canonical home unchanged.
    expect($story->room_id)->toBe($eventRoom->id);
    expect(Story::count())->toBe(1);

    // Person archive surfaces it.
    $ids = $archive->storiesQuery($personRooms[$people[0]->id])->pluck('stories.id')->all();
    expect($ids)->toContain($story->id);

    // Event room query still returns it.
    $eventIds = $archive->storiesQuery($eventRoom)->pluck('stories.id')->all();
    expect($eventIds)->toContain($story->id);
});

test('multiple tagged people see the same story with no duplication', function () {
    [$owner, $people, $personRooms, $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $archive = app(PersonArchiveService::class);

    $story = $storySvc->createStory($owner, $eventRoom, [
        'title' => 'Group photo',
        'type' => 'photo',
        'person_ids' => [$people[0]->id, $people[1]->id, $people[2]->id],
    ]);

    expect(Story::count())->toBe(1);
    expect(PersonStoryLink::where('story_id', $story->id)->count())->toBe(3);

    foreach ($people as $person) {
        $ids = $archive->storiesQuery($personRooms[$person->id])->pluck('stories.id')->all();
        expect($ids)->toBe([$story->id]);
    }
});

test('untagged stories do not appear in unrelated person rooms', function () {
    [$owner, $people, $personRooms, $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $archive = app(PersonArchiveService::class);

    $storySvc->createStory($owner, $eventRoom, ['title' => 'Untagged', 'type' => 'photo']);

    foreach ($people as $person) {
        expect($archive->storiesQuery($personRooms[$person->id])->count())->toBe(0);
        expect($archive->archiveCount($personRooms[$person->id]))->toBe(0);
    }

    expect($archive->archiveCount($eventRoom))->toBe(1);
});

test('direct stories in a person room surface alongside linked stories, deduped', function () {
    [$owner, $people, $personRooms, $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $archive = app(PersonArchiveService::class);
    $personRoom = $personRooms[$people[0]->id];

    $direct = $storySvc->createStory($owner, $personRoom, ['title' => 'Direct', 'type' => 'photo']);
    $linked = $storySvc->createStory($owner, $eventRoom, [
        'title' => 'Linked',
        'type' => 'photo',
        'person_ids' => [$people[0]->id],
    ]);

    $ids = $archive->storiesQuery($personRoom)->pluck('stories.id')->sort()->values()->all();
    expect($ids)->toBe(collect([$direct->id, $linked->id])->sort()->values()->all());

    $meta = $archive->meta($personRoom);
    expect($meta['direct_count'])->toBe(1);
    expect($meta['linked_count'])->toBe(1);
    expect($meta['archive_count'])->toBe(2);
    expect($meta['person']['id'])->toBe($people[0]->id);

    // A story both stored in AND linked to the same person room appears once.
    $storySvc->syncTaggedPeople($direct, $owner, [$people[0]->id]);
    $ids = $archive->storiesQuery($personRoom)->pluck('stories.id')->all();
    expect(count($ids))->toBe(2);
    expect(count(array_unique($ids)))->toBe(2);
});

test('detagging removes the story from the person archive only', function () {
    [$owner, $people, $personRooms, $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $archive = app(PersonArchiveService::class);

    $story = $storySvc->createStory($owner, $eventRoom, [
        'title' => 'Temp',
        'type' => 'photo',
        'person_ids' => [$people[0]->id],
    ]);

    $storySvc->syncTaggedPeople($story, $owner, []);

    expect($archive->storiesQuery($personRooms[$people[0]->id])->count())->toBe(0);
    expect($story->fresh()->room_id)->toBe($eventRoom->id);
    expect(Story::count())->toBe(1);
});

test('dashboard person room show lists linked stories with archive meta', function () {
    [$owner, $people, $personRooms, $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $this->actingAs($owner);

    $story = $storySvc->createStory($owner, $eventRoom, [
        'title' => 'Linked memory',
        'type' => 'photo',
        'person_ids' => [$people[0]->id],
    ]);

    $response = $this->get(route('dashboard.rooms.show', $personRooms[$people[0]->id]));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/rooms/show')
        ->where('stories.0.uuid', $story->uuid)
        ->where('archive.archive_count', 1)
        ->where('room.archive_stories_count', 1)
    );

    // Event room page is unaffected.
    $eventResponse = $this->get(route('dashboard.rooms.show', $eventRoom));
    $eventResponse->assertOk();
    $eventResponse->assertInertia(fn ($page) => $page
        ->where('stories.0.uuid', $story->uuid)
        ->where('archive', null)
    );
});

test('api person room show surfaces linked stories', function () {
    [$owner, $people, $personRooms, $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $this->actingAs($owner);

    $story = $storySvc->createStory($owner, $eventRoom, [
        'title' => 'Linked memory',
        'type' => 'photo',
        'person_ids' => [$people[0]->id],
    ]);

    $this->getJson(route('api.v1.rooms.show', $personRooms[$people[0]->id]))
        ->assertOk()
        ->assertJsonPath('data.archive.archive_count', 1)
        ->assertJsonFragment(['uuid' => $story->uuid]);
});

test('person profile stories view uses the same links', function () {
    [$owner, $people, , $eventRoom] = surfacingSetup();
    $storySvc = app(StoryService::class);
    $this->actingAs($owner);

    $person = $people[0];
    $person->permissions()->create([
        'grantee_type' => 'user',
        'grantee_id' => $owner->id,
        'ability' => 'view',
        'allowed' => true,
    ]);

    $story = $storySvc->createStory($owner, $eventRoom, [
        'title' => 'Linked memory',
        'type' => 'photo',
        'person_ids' => [$person->id],
    ]);

    $response = $this->get(route('people.stories', $person));
    $response->assertOk();
    expect($person->stories()->pluck('stories.id')->all())->toContain($story->id);
});
