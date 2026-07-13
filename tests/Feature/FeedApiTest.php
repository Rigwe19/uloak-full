<?php

use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->room = Room::factory()->create(['created_by' => $this->user->id]);

    Story::factory()->create([
        'room_id' => $this->room->id,
        'user_id' => $this->user->id,
        'type' => 'video',
        'title' => 'Video 1',
        'file_url' => 'https://example.com/video1.mp4',
    ]);

    Story::factory()->create([
        'room_id' => $this->room->id,
        'user_id' => $this->user->id,
        'type' => 'video',
        'title' => 'Video 2',
        'file_url' => 'https://example.com/video2.mp4',
    ]);

    Story::factory()->create([
        'room_id' => $this->room->id,
        'user_id' => $this->user->id,
        'type' => 'photo',
        'title' => 'Photo 1',
    ]);
});

test('unauthenticated requests are rejected', function () {
    $response = $this->getJson('/api/feed?room='.$this->room->id);

    $response->assertUnauthorized();
});

test('returns paginated video stories for a room', function () {
    $this->actingAs($this->user);

    $response = $this->getJson('/api/feed?room='.$this->room->id);

    $response->assertOk();
    $response->assertJsonStructure([
        'data' => [
            '*' => ['id', 'uuid', 'title', 'type', 'file_url', 'author', 'date'],
        ],
        'next_cursor',
        'has_more',
    ]);

    expect($response->json('data'))->toHaveCount(2);
});

test('only returns video type stories', function () {
    $this->actingAs($this->user);

    $response = $this->getJson('/api/feed?room='.$this->room->id);

    $types = collect($response->json('data'))->pluck('type')->unique()->all();
    expect($types)->each->toBe('video');
});

test('returns empty when no video stories exist', function () {
    $this->actingAs($this->user);

    $emptyRoom = Room::factory()->create(['created_by' => $this->user->id]);

    $response = $this->getJson('/api/feed?room='.$emptyRoom->id);

    $response->assertOk();
    expect($response->json('data'))->toBe([]);
    expect($response->json('next_cursor'))->toBeNull();
    expect($response->json('has_more'))->toBeFalse();
});

test('respects the cursor parameter', function () {
    $this->actingAs($this->user);

    Story::where('room_id', $this->room->id)->where('type', 'video')->delete();

    $videos = [];
    for ($i = 1; $i <= 5; $i++) {
        $videos[] = Story::factory()->create([
            'room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'type' => 'video',
            'title' => "Video $i",
        ]);
    }

    $firstResponse = $this->getJson('/api/feed?room='.$this->room->id);
    expect($firstResponse->json('data'))->toHaveCount(5);

    $cursorId = $videos[0]->id + 3; // cursor past the first few
    $cursorResponse = $this->getJson('/api/feed?room='.$this->room->id.'&cursor='.$cursorId);
    $cursorData = $cursorResponse->json('data');

    foreach ($cursorData as $item) {
        expect($item['id'])->toBeLessThan($cursorId);
    }
});

test('validates the room parameter', function () {
    $this->actingAs($this->user);

    $response = $this->getJson('/api/feed');
    $response->assertStatus(422);

    $response = $this->getJson('/api/feed?room=99999');
    $response->assertStatus(422);
});

test('returns correct next_cursor and has_more', function () {
    $this->actingAs($this->user);

    Story::where('room_id', $this->room->id)->where('type', 'video')->delete();
    Story::where('room_id', $this->room->id)->where('type', 'photo')->delete();

    for ($i = 1; $i <= 12; $i++) {
        Story::factory()->create([
            'room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'type' => 'video',
            'title' => "Video $i",
        ]);
    }

    $firstResponse = $this->getJson('/api/feed?room='.$this->room->id);
    expect($firstResponse->json('data'))->toHaveCount(10);
    expect($firstResponse->json('has_more'))->toBeTrue();
    expect($firstResponse->json('next_cursor'))->not->toBeNull();

    $cursor = $firstResponse->json('next_cursor');
    $secondResponse = $this->getJson('/api/feed?room='.$this->room->id.'&cursor='.$cursor);
    $secondData = $secondResponse->json('data');
    expect($secondData)->toHaveCount(2);
    expect($secondResponse->json('has_more'))->toBeFalse();
    expect($secondResponse->json('next_cursor'))->toBe($secondData[count($secondData) - 1]['id']);
});

test('eager loads user relationship', function () {
    $this->actingAs($this->user);

    $response = $this->getJson('/api/feed?room='.$this->room->id);

    $response->assertOk();
    $video = $response->json('data')[0];
    expect($video)->toHaveKey('user');
    expect($video['user']['name'])->toBe($this->user->name);
});
