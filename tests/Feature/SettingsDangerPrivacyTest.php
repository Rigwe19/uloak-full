<?php

use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('privacy settings page renders persisted values', function () {
    $user = User::factory()->create(['privacy_settings' => ['global_discovery' => true, 'member_uploads' => false, 'high_fidelity' => false]]);
    $this->actingAs($user);

    $response = $this->get(route('privacy.edit'));

    $response->assertOk();
    $response->assertInertia(function ($page) {
        $page->component('settings/privacy')
            ->where('settings.0.id', 'global_discovery')
            ->where('settings.0.active', true)
            ->where('settings.1.active', false);
    });
});

test('privacy settings update persists toggles', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->put(route('privacy.update'), [
        'settings' => [
            ['id' => 'global_discovery', 'active' => true],
            ['id' => 'member_uploads', 'active' => false],
            ['id' => 'high_fidelity', 'active' => false],
        ],
    ])->assertRedirect();

    expect($user->fresh()->privacy_settings)->toMatchArray([
        'global_discovery' => true,
        'member_uploads' => false,
        'high_fidelity' => false,
    ]);
});

test('privacy settings defaults apply when nothing persisted', function () {
    $user = User::factory()->create(['privacy_settings' => null]);

    expect($user->privacySettings())->toBe([
        'global_discovery' => false,
        'member_uploads' => true,
        'high_fidelity' => true,
    ]);
});

test('danger zone shows archived state and exports data', function () {
    $user = User::factory()->create();
    $person = Person::factory()->create(['user_id' => $user->id, 'created_by' => $user->id]);
    $this->actingAs($user);

    $this->get(route('settings.danger-zone'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/danger-zone')->where('archived', false)->where('hasPerson', true));

    $export = $this->get(route('settings.danger-zone.export'));
    $export->assertOk();
    expect($export->headers->get('Content-Type'))->toContain('json');

    // Archive then reactivate
    $this->post(route('settings.danger-zone.archive'))->assertRedirect();
    expect($person->fresh()->trashed())->toBeTrue();

    $this->post(route('settings.danger-zone.restore'))->assertRedirect();
    expect($person->fresh()->trashed())->toBeFalse();
});

test('danger zone delete account requires password and deletes user', function () {
    $user = User::factory()->create(['password' => 'password']);
    $this->actingAs($user);

    $this->delete(route('profile.destroy'), ['password' => 'wrong-password'])
        ->assertSessionHasErrors('password');
    expect(User::find($user->id))->not->toBeNull();

    $this->delete(route('profile.destroy'), ['password' => 'password']);
    // User is logged out and deleted; assert DB no longer has them
    $this->assertGuest();
    expect(User::find($user->id))->toBeNull();
});
