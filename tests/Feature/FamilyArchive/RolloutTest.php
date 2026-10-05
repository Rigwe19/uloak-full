<?php

use App\Models\Person;
use App\Models\PersonRelationship;
use App\Models\PersonStoryLink;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Database\Seeders\FamilyArchiveSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;

uses(RefreshDatabase::class);

test('keeper can retag an existing story via the update route', function () {
    $owner = User::factory()->create();
    $room = Room::factory()->starter()->create(['created_by' => $owner->id]);
    $ada = Person::factory()->create(['user_id' => $owner->id, 'created_by' => $owner->id]);
    $story = Story::factory()->create(['room_id' => $room->id, 'user_id' => $owner->id, 'title' => 'Old']);
    $this->actingAs($owner);

    $this->put(route('dashboard.stories.update', $story), [
        'title' => 'Old',
        'person_ids' => [$ada->id],
    ])->assertRedirect();

    expect(PersonStoryLink::where('story_id', $story->id)->where('person_id', $ada->id)->exists())->toBeTrue();
});

test('non-owner cannot retag a story', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $room = Room::factory()->starter()->create(['created_by' => $owner->id]);
    $story = Story::factory()->create(['room_id' => $room->id, 'user_id' => $owner->id, 'title' => 'Old']);
    $this->actingAs($intruder);

    $this->put(route('dashboard.stories.update', $story), [
        'title' => 'Hacked',
    ])->assertForbidden();

    expect($story->fresh()->title)->toBe('Old');
});

test('archive status command reports rollout state', function () {
    $owner = User::factory()->create();
    Room::factory()->starter()->create(['created_by' => $owner->id]);
    Story::factory()->create(['title' => 'Untagged']);

    $this->artisan('archive:status')
        ->expectsOutputToContain('Rooms by kind:')
        ->expectsOutputToContain('Stories tagged: 0 / 1')
        ->assertSuccessful();
});

test('seeder exits cleanly without input and creates nothing', function () {
    $this->artisan('db:seed', ['--class' => FamilyArchiveSeeder::class])->assertSuccessful();

    expect(Person::count())->toBe(0);
    expect(Room::count())->toBe(0);
});

test('seeder builds people relationships and branch rooms from json', function () {
    $owner = User::factory()->create(['email' => 'keeper@example.com']);
    $path = sys_get_temp_dir().'/family-archive-test-'.uniqid().'.json';
    File::put($path, json_encode([
        'owner_email' => 'keeper@example.com',
        'root' => [
            'grandparents' => [
                ['legal_name' => 'Grandpa Test', 'display_name' => 'Grandpa'],
                ['legal_name' => 'Grandma Test', 'display_name' => 'Grandma'],
            ],
            'room_name' => '[Root] Test Family',
        ],
        'branches' => [
            [
                'room_name' => '[Branch] Chidi Test',
                'child' => ['legal_name' => 'Chidi Test', 'display_name' => 'Chidi'],
                'grandchildren' => [
                    ['legal_name' => 'Ada Test', 'display_name' => 'Ada'],
                ],
            ],
        ],
    ]));

    try {
        (new FamilyArchiveSeeder)->sourcePath($path)->run();
        (new FamilyArchiveSeeder)->sourcePath($path)->run(); // idempotent re-run
    } finally {
        File::delete($path);
    }

    expect(Person::where('created_by', $owner->id)->count())->toBe(4);
    expect(PersonRelationship::count())->toBe(4); // spouses + 2x child-of + grandchild-of
    expect(Room::where('created_by', $owner->id)->where('kind', 'root')->count())->toBe(1);
    expect(Room::where('created_by', $owner->id)->where('kind', 'branch')->count())->toBe(1);
    expect(Room::where('created_by', $owner->id)->where('kind', 'person')->count())->toBe(0);
});
