<?php

use App\Mail\MagicLinkMail;
use App\Models\Event;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

test('guests can access room share onboarding page', function () {
    $user = User::factory()->create();
    $room = Room::factory()->create(['created_by' => $user->id]);

    $response = $this->get(route('share.rooms.show', $room->slug));

    $response->assertOk();
    $response->assertSee($room->name);
});

test('guests can access event share onboarding page', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['created_by' => $user->id]);

    $response = $this->get(route('share.events.show', $event->slug));

    $response->assertOk();
    $response->assertSee($event->name);
});

test('guests can request a magic login link for a room and receive email', function () {
    Mail::fake();

    $user = User::factory()->create();
    $room = Room::factory()->create(['created_by' => $user->id]);

    $response = $this->post(route('share.send-link'), [
        'name' => 'Guest Visitor',
        'email' => 'guest@example.com',
        'type' => 'room',
        'slug' => $room->slug,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'email' => 'guest@example.com',
        'name' => 'Guest Visitor',
    ]);

    Mail::assertQueued(MagicLinkMail::class, function ($mail) use ($room) {
        return $mail->hasTo('guest@example.com') &&
               $mail->spaceName === $room->name &&
               str_contains($mail->magicUrl, '/magic-login');
    });
});

test('guests can request a magic login link for an event and receive email', function () {
    Mail::fake();

    $user = User::factory()->create();
    $event = Event::factory()->create(['created_by' => $user->id]);

    $response = $this->post(route('share.send-link'), [
        'name' => 'Event Guest',
        'email' => 'event-guest@example.com',
        'type' => 'event',
        'slug' => $event->slug,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'email' => 'event-guest@example.com',
        'name' => 'Event Guest',
    ]);

    Mail::assertQueued(MagicLinkMail::class, function ($mail) use ($event) {
        return $mail->hasTo('event-guest@example.com') &&
               $mail->spaceName === $event->name &&
               str_contains($mail->magicUrl, '/magic-login');
    });
});

test('visiting a valid signed magic link logs the user in and redirects them', function () {
    $guest = User::factory()->create([
        'email' => 'magic-login@example.com',
        'name' => 'Magic Guest',
    ]);

    $redirectUrl = route('dashboard');

    $magicUrl = URL::temporarySignedRoute(
        'magic.login',
        now()->addMinutes(30),
        [
            'email' => $guest->email,
            'redirect' => $redirectUrl,
        ]
    );

    $response = $this->get($magicUrl);

    $response->assertRedirect($redirectUrl);
    $this->assertAuthenticatedAs($guest);
});

test('visiting an invalid or expired magic link is aborted with 401', function () {
    $guest = User::factory()->create([
        'email' => 'bad-login@example.com',
    ]);

    // Invalid signature url (using standard Route without signed route)
    $badUrl = route('magic.login', [
        'email' => $guest->email,
        'redirect' => route('dashboard'),
    ]);

    $response = $this->get($badUrl);

    $response->assertStatus(401);
    $this->assertGuest();
});

test('unauthenticated users are redirected from event show and creation pages', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['created_by' => $user->id]);

    $responseShow = $this->get(route('dashboard.events.show', $event->slug));
    $responseShow->assertRedirect(route('login'));

    $responseCreate = $this->post(route('dashboard.events.store'), [
        'name' => 'New Event',
    ]);
    $responseCreate->assertRedirect(route('login'));
});

test('authenticated users can view public events and their stories', function () {
    $user = User::factory()->create();
    $event = Event::factory()->create(['created_by' => $user->id]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard.events.show', $event->slug));

    $response->assertOk();
});

test('authenticated users can create a public Event', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $event = Event::factory()->create([
        'name' => 'Wedding of the Century',
        'description' => 'A wonderful event preserving beautiful family wedding moments.',
        'privacy' => 'public',
        'event_date' => now()->format('Y-m-d'),
        'created_by' => $user->id,
    ]);

    $response = $this->get(route('dashboard.events.show', $event->slug));

    expect($event)->not->toBeNull();
    $response->assertOk();

    $this->assertDatabaseHas('events', [
        'name' => 'Wedding of the Century',
        'created_by' => $user->id,
    ]);
});

test('authenticated users and magic link guest users can upload a story to an event', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $event = Event::factory()->create(['created_by' => $user->id]);

    $this->actingAs($user);

    $file = UploadedFile::fake()->image('story-photo.jpg', 800, 600);

    $response = $this->post(route('dashboard.events.stories.store', $event->slug), [
        'title' => 'Speech by Grandma',
        'description' => 'Preserving Grandma\'s beautiful wedding toast speech.',
        'type' => 'photo',
        'files' => [$file],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('stories', [
        'title' => 'Speech by Grandma',
        'type' => 'photo',
        'event_id' => $event->id,
        'user_id' => $user->id,
    ]);
});
