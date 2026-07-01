<?php

namespace App\Console\Commands;

use App\Mail\MediaUploadReminderMail;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('app:send-media-upload-reminders')]
#[Description('Send media upload reminders to guests of rooms whose event was yesterday')]
class SendMediaUploadReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $yesterday = CarbonImmutable::yesterday()->toDateString();

        $rooms = Room::whereDate('start_date', $yesterday)
            ->with(['guestSubscriptions', 'creator'])
            ->get();

        if ($rooms->isEmpty()) {
            $this->info('No rooms with events ending yesterday found.');

            return;
        }

        $totalSent = 0;

        foreach ($rooms as $room) {
            foreach ($room->guestSubscriptions as $subscription) {
                $ownerName = $room->creator?->name ?? $room->name;

                Mail::to($subscription->email)->send(new MediaUploadReminderMail(
                    name: $subscription->name,
                    roomName: $room->name,
                    roomUrl: route('share.rooms.show', $room->slug),
                    ownerName: $ownerName,
                ));

                $totalSent++;
            }

            $this->info("Sent reminders for room '{$room->name}' ({$room->guestSubscriptions->count()} recipients)");
        }

        $this->info("Done. Sent {$totalSent} reminder email(s).");
    }
}
