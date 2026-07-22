<?php

use App\Models\Like;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->room = Room::factory()->create(['created_by' => $this->user->id]);
    $this->story = Story::factory()->create(['room_id' => $this->room->id, 'user_id' => $this->user->id]);
});

test('authenticated user can toggle like on a story', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('stories.likes.toggle', $this->story));

    $response->assertOk()
        ->assertJson([
            'likes_count' => 1,
            'is_liked' => true,
        ]);

    $this->assertDatabaseHas('likes', [
        'user_id' => $this->user->id,
        'story_id' => $this->story->id,
    ]);
});

test('authenticated user can unlike a story', function () {
    $this->actingAs($this->user);

    // First like
    $this->post(route('stories.likes.toggle', $this->story));

    // Then unlike
    $response = $this->post(route('stories.likes.toggle', $this->story));

    $response->assertOk()
        ->assertJson([
            'likes_count' => 0,
            'is_liked' => false,
        ]);

    $this->assertDatabaseMissing('likes', [
        'user_id' => $this->user->id,
        'story_id' => $this->story->id,
    ]);
});

test('guest user can like a story with email', function () {
    $email = 'guest@example.com';

    $response = $this->post(route('stories.likes.toggle', $this->story), [
        'guest_email' => $email,
    ]);

    $response->assertOk()
        ->assertJson([
            'likes_count' => 1,
            'is_liked' => true,
        ]);

    $guestIdentifier = hash('sha256', strtolower($email));
    $this->assertDatabaseHas('likes', [
        'guest_identifier' => $guestIdentifier,
        'story_id' => $this->story->id,
    ]);
});

test('guest user cannot like without email', function () {
    $response = $this->post(route('stories.likes.toggle', $this->story));

    $response->assertStatus(422)
        ->assertJson(['error' => 'Guest email required']);
});

test('like status returns correct state for authenticated user', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('stories.likes.status', $this->story));
    $response->assertOk()
        ->assertJson([
            'likes_count' => 0,
            'is_liked' => false,
        ]);

    // Create a like
    Like::create([
        'user_id' => $this->user->id,
        'story_id' => $this->story->id,
    ]);

    $response = $this->get(route('stories.likes.status', $this->story));
    $response->assertOk()
        ->assertJson([
            'likes_count' => 1,
            'is_liked' => true,
        ]);
});

test('like status returns correct state for guest user', function () {
    $email = 'guest@example.com';
    $guestIdentifier = hash('sha256', strtolower($email));

    // Guest has liked
    Like::create([
        'guest_identifier' => $guestIdentifier,
        'story_id' => $this->story->id,
    ]);

    $response = $this->get(route('stories.likes.status', $this->story).'?guest_email='.$email);

    $response->assertOk()
        ->assertJson([
            'likes_count' => 1,
            'is_liked' => true,
        ]);
});

test('like model has isGuestLike method', function () {
    $guestLike = Like::create([
        'guest_identifier' => hash('sha256', 'guest@test.com'),
        'story_id' => $this->story->id,
    ]);

    $userLike = Like::create([
        'user_id' => $this->user->id,
        'story_id' => $this->story->id,
    ]);

    expect($guestLike->isGuestLike())->toBeTrue();
    expect($userLike->isGuestLike())->toBeFalse();
});

test('story has likes relationship', function () {
    $anotherUser = User::factory()->create();

    Like::create(['story_id' => $this->story->id, 'user_id' => $this->user->id]);
    Like::create(['story_id' => $this->story->id, 'user_id' => $anotherUser->id]);

    expect($this->story->likes)->toHaveCount(2);
    expect($this->story->likesCount())->toBe(2);
});
