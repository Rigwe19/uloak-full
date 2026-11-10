<?php

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('well-known endpoints serve empty claims when unconfigured', function () {
    $this->get('/.well-known/apple-app-site-association')->assertOk()->assertJson([
        'applinks' => ['details' => []],
    ]);

    $this->get('/.well-known/assetlinks.json')->assertOk()->assertExactJson([]);
});

test('well-known endpoints claim share paths when configured', function () {
    config()->set('universal-links.ios.app_id', 'ABCDE12345.com.example.ulo');
    config()->set('universal-links.ios.paths', ['/share/rooms/*', '/share/events/*', '/creators/*']);
    config()->set('universal-links.android.package', 'com.example.ulo');
    config()->set('universal-links.android.fingerprints', ['AA:BB:CC']);

    $apple = $this->get('/.well-known/apple-app-site-association')
        ->assertOk()
        ->assertJsonPath('applinks.details.0.appIDs.0', 'ABCDE12345.com.example.ulo')
        ->assertJsonPath('applinks.details.0.components.0.#', '/share/rooms/*');

    $this->get('/.well-known/assetlinks.json')
        ->assertOk()
        ->assertJsonPath('0.relation.0', 'delegate_permission/common.handle_all_urls')
        ->assertJsonPath('0.target.package_name', 'com.example.ulo')
        ->assertJsonPath('0.target.sha256_cert_fingerprints.0', 'AA:BB:CC');
});

test('share share payload exposes custom-scheme deep link', function () {
    $owner = User::factory()->create();
    $room = Room::factory()->create(['created_by' => $owner->id, 'privacy' => 'public', 'enable_tributes' => false]);

    // Inertia payload check via API share (JSON parity)
    $response = $this->getJson(route('api.v1.share.rooms.show', $room->slug));

    $response->assertOk();
    $response->assertJsonPath('data.room.deep_link', 'ulo://share/rooms/'.$room->slug);
    $response->assertJsonPath('data.room.share_url', url()->route('share.rooms.show', $room->slug));

    // Web Inertia payload also carries deep_link
    $web = $this->get(route('share.rooms.show', $room->slug));
    $web->assertOk();
    $web->assertInertia(function ($page) use ($room) {
        $page->component('share/room-share')
            ->where('room.deep_link', 'ulo://share/rooms/'.$room->slug);
    });
});
