<?php

use App\Enums\RoomKind;
use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Person;
use App\Models\Room;
use App\Models\User;
use App\Services\RoomService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

function makeOwnerWithPerson(): array
{
    $owner = User::factory()->create();
    $person = Person::factory()->create([
        'user_id' => $owner->id,
        'created_by' => $owner->id,
    ]);

    return [$owner, $person];
}

test('root room is created free with null tier and no expiry', function () {
    [$owner] = makeOwnerWithPerson();
    $room = app(RoomService::class)->createRoom($owner, [
        'name' => '[Root] Grandpa & Grandma Adim',
        'privacy' => 'private',
        'kind' => 'root',
    ]);

    expect($room->kind)->toBe(RoomKind::Root);
    expect($room->tier_type)->toBeNull();
    expect($room->status)->toBe(RoomStatus::Active);
    expect($room->expires_at)->toBeNull();
    expect($room->storage_limit_bytes)->toBeNull();
    expect($room->person_id)->toBeNull();
    expect($room->isStructural())->toBeTrue();
});

test('branch room is created free even when owner already has an active starter', function () {
    [$owner] = makeOwnerWithPerson();
    $svc = app(RoomService::class);

    $svc->createRoom($owner, ['name' => 'Starter', 'privacy' => 'private', 'room_type' => 'general']);

    $branch = $svc->createRoom($owner, [
        'name' => '[Branch] Chidi Adim & Family',
        'privacy' => 'private',
        'kind' => 'branch',
    ]);

    expect($branch->kind)->toBe(RoomKind::Branch);
    expect($branch->tier_type)->toBeNull();
    expect($branch->expires_at)->toBeNull();
});

test('structural rooms do not consume the starter limit', function () {
    [$owner] = makeOwnerWithPerson();
    $svc = app(RoomService::class);

    $svc->createRoom($owner, ['name' => 'Root', 'privacy' => 'private', 'kind' => 'root']);
    $svc->createRoom($owner, ['name' => 'Branch', 'privacy' => 'private', 'kind' => 'branch']);

    // A starter event room is still allowed: only event starters count.
    $starter = $svc->createRoom($owner, ['name' => 'Starter', 'privacy' => 'private', 'room_type' => 'general']);
    expect($starter->tier_type)->toBe(RoomTier::Starter);

    // But a second starter event room is still rejected.
    expect(fn () => $svc->createRoom($owner, ['name' => 'Second', 'privacy' => 'private']))
        ->toThrow(ValidationException::class);
});

test('person room is created free and resolves its person', function () {
    [$owner, $person] = makeOwnerWithPerson();

    $room = app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Ngozi Adim',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $person->id,
    ]);

    expect($room->kind)->toBe(RoomKind::Person);
    expect($room->tier_type)->toBeNull();
    expect($room->expires_at)->toBeNull();
    expect($room->person->id)->toBe($person->id);
    expect($person->fresh()->personRoom->id)->toBe($room->id);
});

test('person room requires person_id', function () {
    [$owner] = makeOwnerWithPerson();

    expect(fn () => app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Nobody',
        'privacy' => 'private',
        'kind' => 'person',
    ]))->toThrow(ValidationException::class, 'requires a person');
});

test('non-person rooms force person_id to null', function () {
    [$owner, $person] = makeOwnerWithPerson();
    $svc = app(RoomService::class);

    $event = $svc->createRoom($owner, [
        'name' => 'General Event',
        'privacy' => 'private',
        'kind' => 'event',
        'person_id' => $person->id,
    ]);
    expect($event->person_id)->toBeNull();

    $root = $svc->createRoom($owner, [
        'name' => 'Root',
        'privacy' => 'private',
        'kind' => 'root',
        'person_id' => $person->id,
    ]);
    expect($root->person_id)->toBeNull();
});

test('two rooms cannot link to the same person', function () {
    [$owner, $person] = makeOwnerWithPerson();
    $svc = app(RoomService::class);

    $svc->createRoom($owner, [
        'name' => '[Person] Ngozi Adim',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $person->id,
    ]);

    expect(fn () => $svc->createRoom($owner, [
        'name' => '[Person] Ngozi Duplicate',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $person->id,
    ]))->toThrow(ValidationException::class, 'already has a person room');
});

test('event rooms retain existing paywall behaviour', function () {
    [$owner] = makeOwnerWithPerson();

    expect(fn () => app(RoomService::class)->createRoom($owner, [
        'name' => 'Wedding',
        'privacy' => 'private',
        'kind' => 'event',
        'room_type' => 'wedding',
    ]))->toThrow(ValidationException::class);
});

test('dashboard store creates structural rooms without hitting the paywall', function () {
    [$owner, $person] = makeOwnerWithPerson();
    $this->actingAs($owner);

    // Owner already has a starter; structural rooms must still go through.
    $this->post(route('dashboard.rooms.store'), [
        'name' => 'Starter',
        'privacy' => 'private',
        'room_type' => 'general',
    ])->assertRedirect();

    $this->post(route('dashboard.rooms.store'), [
        'name' => '[Branch] Chidi Adim & Family',
        'privacy' => 'private',
        'kind' => 'branch',
    ])->assertRedirect(route('dashboard.rooms.show', Room::where('name', '[Branch] Chidi Adim & Family')->firstOrFail()));

    $this->post(route('dashboard.rooms.store'), [
        'name' => '[Person] Ngozi Adim',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $person->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('rooms', ['name' => '[Branch] Chidi Adim & Family', 'kind' => 'branch', 'tier_type' => null]);
    $this->assertDatabaseHas('rooms', ['name' => '[Person] Ngozi Adim', 'kind' => 'person', 'person_id' => $person->id, 'tier_type' => null]);
});

test('dashboard store rejects person room without person_id', function () {
    [$owner] = makeOwnerWithPerson();
    $this->actingAs($owner);

    $this->post(route('dashboard.rooms.store'), [
        'name' => '[Person] Nobody',
        'privacy' => 'private',
        'kind' => 'person',
    ])->assertSessionHasErrors('person_id');
});

test('room kind is immutable on update', function () {
    [$owner] = makeOwnerWithPerson();
    $this->actingAs($owner);

    $room = app(RoomService::class)->createRoom($owner, [
        'name' => 'Starter',
        'privacy' => 'private',
        'room_type' => 'general',
    ]);

    $this->put(route('dashboard.rooms.update', $room), [
        'name' => 'Starter',
        'privacy' => 'private',
        'kind' => 'branch',
    ])->assertSessionHasErrors('kind');

    expect($room->fresh()->kind)->toBe(RoomKind::Event);
});

test('api store creates structural rooms without 402', function () {
    [$owner, $person] = makeOwnerWithPerson();
    $this->actingAs($owner);

    $this->postJson(route('api.v1.rooms.store'), [
        'name' => '[Branch] Chidi Adim & Family',
        'privacy' => 'private',
        'kind' => 'branch',
    ])->assertCreated();

    $this->postJson(route('api.v1.rooms.store'), [
        'name' => '[Person] Ngozi Adim',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $person->id,
    ])->assertCreated();
});
