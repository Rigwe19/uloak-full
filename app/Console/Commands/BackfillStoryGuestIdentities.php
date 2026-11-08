<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BackfillStoryGuestIdentities extends Command
{
    protected $signature = 'stories:backfill-guest-identities';

    protected $description = 'Backfill stories.guest_identity_id from linked Media or GuestIdentity name/email match (idempotent)';

    public function handle(): int
    {
        if (! Schema::hasColumn('stories', 'guest_identity_id')) {
            $this->error('stories.guest_identity_id column does not exist. Run migrations first.');

            return self::FAILURE;
        }

        $stories = DB::table('stories')
            ->whereNull('guest_identity_id')
            ->select('id', 'room_id', 'event_id', 'guest_name', 'guest_email', 'assets')
            ->get();

        if ($stories->isEmpty()) {
            $this->info('No stories to backfill.');

            return self::SUCCESS;
        }

        $media = DB::table('media')
            ->whereNotNull('guest_identity_id')
            ->select('uuid', 'guest_identity_id')
            ->get()
            ->keyBy('uuid');

        $identities = DB::table('guest_identities')
            ->select('id', 'room_id', 'event_id', 'name', 'email')
            ->get();

        $identityIndex = [];
        foreach ($identities as $identity) {
            $scope = $identity->room_id ? 'room:'.$identity->room_id : ($identity->event_id ? 'event:'.$identity->event_id : 'global');
            if ($identity->email) {
                $identityIndex[$scope.'|email|'.strtolower(trim($identity->email))] = $identity->id;
            }
            if ($identity->name) {
                $identityIndex[$scope.'|name|'.strtolower(trim($identity->name))] = $identity->id;
            }
        }

        $filled = 0;
        foreach ($stories as $story) {
            $guestIdentityId = null;

            $assets = $story->assets ? json_decode($story->assets, true) : [];
            if (is_array($assets)) {
                foreach ($assets as $asset) {
                    $uuid = $asset['media_uuid'] ?? null;
                    if ($uuid && isset($media[$uuid])) {
                        $guestIdentityId = $media[$uuid]->guest_identity_id;
                        break;
                    }
                }
            }

            if (! $guestIdentityId) {
                $scope = $story->room_id ? 'room:'.$story->room_id : ($story->event_id ? 'event:'.$story->event_id : 'global');
                if ($story->guest_email) {
                    $guestIdentityId = $identityIndex[$scope.'|email|'.strtolower(trim($story->guest_email))] ?? null;
                }
                if (! $guestIdentityId && $story->guest_name) {
                    $guestIdentityId = $identityIndex[$scope.'|name|'.strtolower(trim($story->guest_name))] ?? null;
                }
            }

            if ($guestIdentityId) {
                DB::table('stories')
                    ->where('id', $story->id)
                    ->update(['guest_identity_id' => $guestIdentityId]);
                $filled++;
            }
        }

        $this->info("Backfilled guest_identity_id on {$filled} / {$stories->count()} story(s).");

        return self::SUCCESS;
    }
}
