<?php

use App\Mail\MediaUploadReminderMail;
use App\Models\Room;
use App\Models\RoomGuestSubscription;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('it sends reminder emails to guests of rooms with yesterday as start_date', function () {
    Mail::fake();

    $yesterday = CarbonImmutable::yesterday()->toDateString();

    $room = Room::factory()->create(['start_date' => $yesterday]);

    $subscription = RoomGuestSubscription::factory()->create([
        'room_id' => $room->id,
    ]);

    $this->artisan('app:send-media-upload-reminders')
        ->assertSuccessful();

    Mail::assertQueued(MediaUploadReminderMail::class, function ($mail) use ($subscription, $room) {
        return $mail->hasTo($subscription->email)
            && $mail->roomName === $room->name
            && $mail->ownerName === $room->creator->name;
    });
});

test('it does not send reminders for rooms with different start_date', function () {
    Mail::fake();

    Room::factory()->create(['start_date' => CarbonImmutable::now()->toDateString()]);

    $this->artisan('app:send-media-upload-reminders')
        ->assertSuccessful();

    Mail::assertNothingSent();
});

test('it does not send reminders when there are no guests subscribed', function () {
    Mail::fake();

    $yesterday = CarbonImmutable::yesterday()->toDateString();

    Room::factory()->create(['start_date' => $yesterday]);

    $this->artisan('app:send-media-upload-reminders')
        ->assertSuccessful();

    Mail::assertNothingSent();
});
