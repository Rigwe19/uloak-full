<?php

use App\Jobs\ProcessTributeAudioTranscription;
use App\Models\Room;
use App\Models\Tribute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Notification::fake();
    $this->user = User::factory()->create();
    $this->room = Room::factory()->create([
        'created_by' => $this->user->id,
        'room_type' => 'birthday',
        'enable_tributes' => true,
    ]);
    Storage::fake('public');
});

test('a text tribute can be submitted to a birthday room', function () {
    $response = $this->post(route('share.rooms.tributes.store', $this->room), [
        'name' => 'Jane Doe',
        'relationship' => 'Friend',
        'message' => 'Happy Birthday! Wishing you all the best!',
        'is_audio_mode' => false,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('tributes', [
        'room_id' => $this->room->id,
        'name' => 'Jane Doe',
        'relationship' => 'Friend',
        'message' => 'Happy Birthday! Wishing you all the best!',
        'audio' => null,
    ]);
});

test('message is required for text mode tribute', function () {
    $response = $this->post(route('share.rooms.tributes.store', $this->room), [
        'name' => 'Jane Doe',
        'is_audio_mode' => false,
        // missing message
    ]);

    $response->assertSessionHasErrors('message');
});

test('an audio tribute can be submitted and job is dispatched', function () {
    Queue::fake();

    $fakeAudioBase64 = 'data:audio/webm;base64,'.base64_encode(str_repeat('X', 100));

    $response = $this->post(route('share.rooms.tributes.store', $this->room), [
        'name' => 'John Singer',
        'relationship' => 'Friend',
        'message' => '',
        'audio' => $fakeAudioBase64,
        'is_audio_mode' => true,
    ]);

    $response->assertRedirect();

    $tribute = Tribute::where('name', 'John Singer')->first();
    expect($tribute)->not->toBeNull();
    expect($tribute->audio)->not->toBeNull();
    expect($tribute->audio_transcript_status)->toBe('processing');
    expect($tribute->message)->toBe('');

    Queue::assertPushed(ProcessTributeAudioTranscription::class, function ($job) use ($tribute) {
        return $job->tribute->id === $tribute->id;
    });
});

test('audio tribute does not require message field', function () {
    Queue::fake();

    $fakeAudioBase64 = 'data:audio/webm;base64,'.base64_encode(str_repeat('X', 100));

    $response = $this->post(route('share.rooms.tributes.store', $this->room), [
        'name' => 'Audio User',
        'audio' => $fakeAudioBase64,
        'is_audio_mode' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('tributes', ['name' => 'Audio User']);
});

test('audio file is stored on disk', function () {
    Queue::fake();

    $fakeAudioBase64 = 'data:audio/webm;base64,'.base64_encode(str_repeat('A', 200));

    $this->post(route('share.rooms.tributes.store', $this->room), [
        'name' => 'Disk Tester',
        'audio' => $fakeAudioBase64,
        'is_audio_mode' => true,
    ]);

    $tribute = Tribute::where('name', 'Disk Tester')->first();
    expect($tribute->audio)->not->toBeNull();

    $storedPath = ltrim($tribute->audio, '/');
    Storage::disk('public')->assertExists($storedPath);
});

test('tribute without audio does not dispatch transcription job', function () {
    Queue::fake();

    $this->post(route('share.rooms.tributes.store', $this->room), [
        'name' => 'Text Only',
        'message' => 'Just a plain message.',
        'is_audio_mode' => false,
    ]);

    Queue::assertNotPushed(ProcessTributeAudioTranscription::class);
});

test('audio transcript status is pending for text tribute', function () {
    $this->post(route('share.rooms.tributes.store', $this->room), [
        'name' => 'Text Writer',
        'message' => 'A lovely message.',
        'is_audio_mode' => false,
    ]);

    $tribute = Tribute::where('name', 'Text Writer')->first();
    expect($tribute->audio_transcript_status)->toBe('pending');
    expect($tribute->audio)->toBeNull();
});
