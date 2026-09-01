<?php

namespace App\Console\Commands;

use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Room;
use Illuminate\Console\Command;

class CloseExpiredStarterRooms extends Command
{
    protected $signature = 'rooms:close-expired-starters';

    protected $description = 'Close new contributions on Starter rooms whose 30-day window has elapsed.';

    public function handle(): int
    {
        $count = Room::query()
            ->where('tier_type', RoomTier::Starter->value)
            ->where('status', RoomStatus::Active->value)
            ->whereNull('contributions_closed_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['contributions_closed_at' => now()]);

        $this->info("Closed {$count} expired Starter room(s).");

        return self::SUCCESS;
    }
}
