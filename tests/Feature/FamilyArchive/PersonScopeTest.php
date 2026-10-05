<?php

use App\Models\Person;
use App\Models\PersonPermission;
use App\Models\Room;
use App\Models\User;
use App\Services\PersonScope;
use App\Services\RoomService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

test('person created by the owner is linkable', function () {
    $owner = User::factory()->create();
    $person = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);

    $found = app(PersonScope::class)->assertLinkable($owner, $person->id);

    expect($found->id)->toBe($person->id);
});

test('another family person id is rejected at the service layer', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $strangerPerson = Person::factory()->create([
        'user_id' => $stranger->id,
        'created_by' => $stranger->id,
    ]);

    // Shape validation (exists:people,id) would pass; the service must fail closed.
    expect(Person::whereKey($strangerPerson->id)->exists())->toBeTrue();

    expect(fn () => app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Stranger',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $strangerPerson->id,
    ]))->toThrow(ValidationException::class, 'not part of your family archive');

    expect(Room::where('person_id', $strangerPerson->id)->exists())->toBeFalse();
});

test('person with an explicit edit grant is linkable', function () {
    $owner = User::factory()->create();
    $keeper = User::factory()->create();
    $person = Person::factory()->create(['user_id' => $keeper->id, 'created_by' => $keeper->id]);

    PersonPermission::create([
        'person_id' => $person->id,
        'grantee_type' => 'user',
        'grantee_id' => $owner->id,
        'ability' => 'edit',
        'allowed' => true,
    ]);

    $room = app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Granted',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => $person->id,
    ]);

    expect($room->person_id)->toBe($person->id);
});

test('nonexistent person id is rejected', function () {
    $owner = User::factory()->create();

    expect(fn () => app(RoomService::class)->createRoom($owner, [
        'name' => '[Person] Ghost',
        'privacy' => 'private',
        'kind' => 'person',
        'person_id' => 999999,
    ]))->toThrow(ValidationException::class);
});
