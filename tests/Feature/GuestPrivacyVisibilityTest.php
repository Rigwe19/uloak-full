<?php

use App\Models\GuestIdentity;
use App\Models\Media;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use App\Services\GuestStoryAccess;
use App\Services\PersonArchiveService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->privateRoom = Room::factory()->create(['created_by' => $this->owner->id, 'privacy' => 'private', 'enable_tributes' => false]);
    $this->publicRoom = Room::factory()->create(['created_by' => $this->owner->id, 'privacy' => 'public', 'enable_tributes' => false]);
});

function guestIdentityFor(Room $room, string $name, ?string $email = null): GuestIdentity
{
    return GuestIdentity::create([
        'room_id' => $room->id,
        'name' => $name,
        'email' => $email ?? strtolower(str_replace(' ', '.', $name)).'@example.com',
        'ip_address' => '127.0.0.1',
        'expires_at' => now()->addYear(),
    ]);
}

function guestStoryFor(Room $room, GuestIdentity $guest, string $title): Story
{
    return Story::create([
        'room_id' => $room->id,
        'user_id' => null,
        'guest_identity_id' => $guest->id,
        'guest_name' => $guest->name,
        'guest_email' => $guest->email,
        'title' => $title,
        'type' => 'photo',
        'file_url' => '/storage/test-'.$title.'.jpg',
        'thumbnail' => '/storage/thumb-'.$title.'.jpg',
        'assets' => [],
        'tags' => ['guest-contribution'],
    ]);
}

test('private room guest sees only own uploads via web share', function () {
    $alice = guestIdentityFor($this->privateRoom, 'Alice');
    $bob = guestIdentityFor($this->privateRoom, 'Bob');
    guestStoryFor($this->privateRoom, $alice, 'Alice Memory');
    guestStoryFor($this->privateRoom, $bob, 'Bob Memory');

    // Use service to assert the filtered set contains only Alice
    $query = app(PersonArchiveService::class)->storiesQuery($this->privateRoom)
        ->whereNull('stories.follow_up_to');
    $query = app(GuestStoryAccess::class)->applyPrivateFilter($query, null, $this->privateRoom, $alice);
    expect($query->pluck('title')->all())->toBe(['Alice Memory']);

    // Bob sees only his own
    $queryBob = app(PersonArchiveService::class)->storiesQuery($this->privateRoom)
        ->whereNull('stories.follow_up_to');
    $queryBob = app(GuestStoryAccess::class)->applyPrivateFilter($queryBob, null, $this->privateRoom, $bob);
    expect($queryBob->pluck('title')->all())->toBe(['Bob Memory']);

    // HTTP smoke: page renders for a cookied guest
    $response = $this->withCookie(GuestStoryAccess::COOKIE, app(GuestStoryAccess::class)->sign($alice->uuid))
        ->get(route('share.rooms.show', $this->privateRoom->slug));
    $response->assertOk();
});

test('private room without identity sees empty feed', function () {
    $alice = guestIdentityFor($this->privateRoom, 'Alice');
    guestStoryFor($this->privateRoom, $alice, 'Alice Memory');

    $query = app(PersonArchiveService::class)->storiesQuery($this->privateRoom)
        ->whereNull('stories.follow_up_to');
    $query = app(GuestStoryAccess::class)->applyPrivateFilter($query, null, $this->privateRoom, null);
    expect($query->count())->toBe(0);
});

test('public room guest sees all uploads', function () {
    $alice = guestIdentityFor($this->publicRoom, 'Alice');
    $bob = guestIdentityFor($this->publicRoom, 'Bob');
    guestStoryFor($this->publicRoom, $alice, 'Alice Public');
    guestStoryFor($this->publicRoom, $bob, 'Bob Public');

    $query = app(PersonArchiveService::class)->storiesQuery($this->publicRoom)
        ->whereNull('stories.follow_up_to');
    $query = app(GuestStoryAccess::class)->applyPrivateFilter($query, null, $this->publicRoom, $bob);
    expect($query->pluck('title')->sort()->values()->all())->toBe(['Alice Public', 'Bob Public']);
});

test('room owner sees all in private room', function () {
    $alice = guestIdentityFor($this->privateRoom, 'Alice');
    $bob = guestIdentityFor($this->privateRoom, 'Bob');
    guestStoryFor($this->privateRoom, $alice, 'Alice Memory');
    guestStoryFor($this->privateRoom, $bob, 'Bob Memory');

    $query = app(PersonArchiveService::class)->storiesQuery($this->privateRoom)
        ->whereNull('stories.follow_up_to');
    $query = app(GuestStoryAccess::class)->applyPrivateFilter($query, $this->owner, $this->privateRoom, null);
    expect($query->count())->toBe(2);
});

test('guest contribution mints signed cookie and links story to guest identity', function () {
    $media = Media::factory()->image()->create(['status' => 'ready']);

    $response = $this->post(route('share.rooms.stories.store', $this->publicRoom), [
        'guest_name' => 'Carol',
        'guest_email' => 'carol@example.com',
        'type' => 'photo',
        'media_uuids' => [$media->uuid],
    ]);

    $response->assertRedirect();
    $response->assertCookie(GuestStoryAccess::COOKIE);

    $story = Story::where('guest_name', 'Carol')->first();
    expect($story)->not->toBeNull();
    expect($story->guest_identity_id)->not->toBeNull();

    $guest = GuestIdentity::find($story->guest_identity_id);
    expect($guest)->not->toBeNull();
    expect($guest->name)->toBe('Carol');
});

test('guest cannot delete another guests story in public room (cookie authority)', function () {
    $alice = guestIdentityFor($this->publicRoom, 'Alice');
    $bob = guestIdentityFor($this->publicRoom, 'Bob');
    $aliceStory = guestStoryFor($this->publicRoom, $alice, 'Alice Public');

    // Bob (cookie = Bob) tries to delete Alice's story — even with Bob name/email
    $response = $this->withCookie(GuestStoryAccess::COOKIE, app(GuestStoryAccess::class)->sign($bob->uuid))
        ->delete(route('share.rooms.stories.destroy', [$this->publicRoom, $aliceStory]), [
            'guest_name' => 'Bob',
            'guest_email' => $bob->email,
        ]);

    // Controller returns redirect with errors for Inertia or 403 for JSON-like; assert story still exists
    expect(Story::find($aliceStory->id))->not->toBeNull();
    $response->assertSessionHasErrors('story');
});

test('guest can edit own title and description but not others (public room)', function () {
    $alice = guestIdentityFor($this->publicRoom, 'Alice');
    $bob = guestIdentityFor($this->publicRoom, 'Bob');
    $aliceStory = guestStoryFor($this->publicRoom, $alice, 'Alice Public');

    // Bob attempts to edit Alice's story
    $bobAttempt = $this->withCookie(GuestStoryAccess::COOKIE, app(GuestStoryAccess::class)->sign($bob->uuid))
        ->patch(route('share.rooms.stories.update', [$this->publicRoom, $aliceStory]), [
            'title' => 'Hijacked',
            'description' => 'Hijacked',
            'guest_name' => 'Bob',
            'guest_email' => $bob->email,
        ]);

    $bobAttempt->assertSessionHasErrors('story');
    expect($aliceStory->fresh()->title)->toBe('Alice Public');

    // Alice edits own story
    $aliceEdit = $this->withCookie(GuestStoryAccess::COOKIE, app(GuestStoryAccess::class)->sign($alice->uuid))
        ->patch(route('share.rooms.stories.update', [$this->publicRoom, $aliceStory]), [
            'title' => 'Alice Updated',
            'description' => 'Updated description',
            'guest_name' => 'Alice',
            'guest_email' => $alice->email,
        ]);

    $aliceEdit->assertRedirect();
    expect($aliceStory->fresh()->title)->toBe('Alice Updated');
    expect($aliceStory->fresh()->description)->toBe('Updated description');
});

test('legacy name email fallback still works for unlinked stories', function () {
    $legacy = Story::create([
        'room_id' => $this->publicRoom->id,
        'user_id' => null,
        'guest_identity_id' => null,
        'guest_name' => 'Legacy Dana',
        'guest_email' => 'dana@example.com',
        'title' => 'Dana Legacy',
        'type' => 'photo',
        'file_url' => '/storage/dana.jpg',
        'assets' => [],
        'tags' => ['guest-contribution'],
    ]);

    $response = $this->delete(route('share.rooms.stories.destroy', [$this->publicRoom, $legacy]), [
        'guest_name' => 'Legacy Dana',
        'guest_email' => 'dana@example.com',
    ]);

    expect(Story::find($legacy->id))->toBeNull();
});

test('private api share filters to own uploads and owner sees all', function () {
    $alice = guestIdentityFor($this->privateRoom, 'Alice');
    $bob = guestIdentityFor($this->privateRoom, 'Bob');
    guestStoryFor($this->privateRoom, $alice, 'Alice Memory');
    guestStoryFor($this->privateRoom, $bob, 'Bob Memory');

    // NB: getJson + withCookie drops cookies on api routes in this Laravel setup,
    // so exercise the API with an explicit cookie bag via call().
    $aliceView = $this->call('GET', route('api.v1.share.rooms.show', $this->privateRoom->slug), [], [GuestStoryAccess::COOKIE => app(GuestStoryAccess::class)->sign($alice->uuid)]);

    $aliceView->assertOk();
    $titles = collect(json_decode($aliceView->getContent(), true)['data']['stories'])->pluck('title')->all();
    expect($titles)->toBe(['Alice Memory']);
    expect(json_decode($aliceView->getContent(), true)['data']['archive'])->toBeNull();

    $bobView = $this->call('GET', route('api.v1.share.rooms.show', $this->privateRoom->slug), [], [GuestStoryAccess::COOKIE => app(GuestStoryAccess::class)->sign($bob->uuid)]);
    expect(collect(json_decode($bobView->getContent(), true)['data']['stories'])->pluck('title')->all())->toBe(['Bob Memory']);

    $ownerView = $this->actingAs($this->owner)->getJson(route('api.v1.share.rooms.show', $this->privateRoom->slug));
    $ownerView->assertOk();
    expect(collect($ownerView->json('data.stories'))->count())->toBe(2);
});

test('private follow up on hidden story is rejected', function () {
    $alice = guestIdentityFor($this->privateRoom, 'Alice');
    $bob = guestIdentityFor($this->privateRoom, 'Bob');
    $bobStory = guestStoryFor($this->privateRoom, $bob, 'Bob Memory');
    $media = Media::factory()->image()->create(['status' => 'ready']);

    $response = $this->withCookie(GuestStoryAccess::COOKIE, app(GuestStoryAccess::class)->sign($alice->uuid))
        ->post(route('share.rooms.stories.followup', $this->privateRoom), [
            'guest_name' => 'Alice',
            'guest_email' => $alice->email,
            'story_id' => $bobStory->id,
            'type' => 'photo',
            'media_uuids' => [$media->uuid],
        ]);

    $response->assertSessionHasErrors('story_id');
    expect(Story::where('follow_up_to', $bobStory->id)->count())->toBe(0);
});

test('private follow up on own story succeeds', function () {
    $alice = guestIdentityFor($this->privateRoom, 'Alice');
    $aliceStory = guestStoryFor($this->privateRoom, $alice, 'Alice Memory');
    $media = Media::factory()->image()->create(['status' => 'ready']);

    $response = $this->withCookie(GuestStoryAccess::COOKIE, app(GuestStoryAccess::class)->sign($alice->uuid))
        ->post(route('share.rooms.stories.followup', $this->privateRoom), [
            'guest_name' => 'Alice',
            'guest_email' => $alice->email,
            'story_id' => $aliceStory->id,
            'type' => 'photo',
            'media_uuids' => [$media->uuid],
        ]);

    $response->assertRedirect();
    expect(Story::where('follow_up_to', $aliceStory->id)->count())->toBe(1);
});
