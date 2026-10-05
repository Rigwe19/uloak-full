<?php

use App\Models\Person;
use App\Models\PersonRelationship;
use App\Models\Room;
use App\Models\User;
use App\Person\Enums\RelationshipType;
use App\Services\PersonService;
use App\Services\RelationshipGraphService;
use App\Services\RoomService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    RelationshipGraphService::flushPersonRoomSlugs();
});

function treeSetup(): array
{
    $owner = User::factory()->create();
    $parent = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);
    $parent->identity()->create(['legal_name' => 'Grandpa', 'display_name' => 'Grandpa']);
    $child = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);
    $child->identity()->create(['legal_name' => 'Chidi', 'display_name' => 'Chidi']);
    PersonRelationship::create([
        'person_id' => $child->id,
        'related_person_id' => $parent->id,
        'relationship_type' => RelationshipType::IsChildOf->value,
        'kind' => 'biological',
        'status' => 'active',
    ]);

    return [$owner, $parent, $child];
}

test('tree nodes carry the person room slug when a room exists', function () {
    [$owner, $parent, $child] = treeSetup();
    $room = app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Chidi',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $child->id,
    ]);

    $tree = app(RelationshipGraphService::class)->buildTree($parent);

    expect($tree['person']['person_room_slug'])->toBeNull();
    expect($tree['descendants'][0]['person']['person_room_slug'])->toBe($room->slug);
});

test('tree nodes have null slug without a person room', function () {
    [, $parent] = treeSetup();

    $tree = app(RelationshipGraphService::class)->buildTree($parent);

    expect($tree['person']['person_room_slug'])->toBeNull();
    expect($tree['descendants'][0]['person']['person_room_slug'])->toBeNull();
});

test('relationship graph lists carry person room slugs', function () {
    [$owner, $parent, $child] = treeSetup();
    $room = app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Chidi',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $child->id,
    ]);

    $graph = app(PersonService::class)->getRelationshipGraph($parent);

    expect($graph['outgoing'])->toBeEmpty();
    expect($graph['incoming'][0]['person_room_slug'])->toBe($room->slug);
});

test('dashboard data includes the archive nav block', function () {
    [$owner, $parent, $child] = treeSetup();
    $this->actingAs($owner);
    $roomSvc = app(RoomService::class);

    $root = $roomSvc->createRoom($owner, ['name' => '[Root] Family', 'privacy' => 'private', 'kind' => 'root']);
    $branch = $roomSvc->createRoom($owner, ['name' => '[Branch] Chidi', 'privacy' => 'private', 'kind' => 'branch']);
    $personRoom = $roomSvc->createRoom($owner, [
        'name' => '[Person] Chidi',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $child->id,
    ]);

    $this->get(route('dashboard'))->assertOk()->assertInertia(fn ($page) => $page
        ->has('dashboardData.archive', 3)
        ->where('dashboardData.archive.0.kind', 'root')
        ->where('dashboardData.archive.0.slug', $root->slug)
        ->where('dashboardData.archive.1.kind', 'branch')
        ->where('dashboardData.archive.1.slug', $branch->slug)
        ->where('dashboardData.archive.2.kind', 'person')
        ->where('dashboardData.archive.2.slug', $personRoom->slug)
        ->where('dashboardData.archive.2.person_name', 'Chidi')
        ->where('dashboardData.archive.2.archive_count', 0)
    );
});

test('dashboard archive block is empty without structural rooms', function () {
    $owner = User::factory()->create();
    $this->actingAs($owner);
    Room::factory()->starter()->create(['created_by' => $owner->id]);

    $this->get(route('dashboard'))->assertOk()->assertInertia(fn ($page) => $page
        ->where('dashboardData.archive', [])
    );
});
