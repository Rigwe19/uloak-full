<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->foreignId('guest_identity_id')
                ->nullable()
                ->after('room_member_id')
                ->constrained('guest_identities')
                ->nullOnDelete();
            $table->index(['room_id', 'guest_identity_id']);
            $table->index(['event_id', 'guest_identity_id']);
        });

        $this->backfillGuestIdentities();
    }

    public function down(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('guest_identity_id');
        });
    }

    /**
     * Best-effort backfill so legacy guest uploads become visible in
     * private rooms. Primary source: Media.guest_identity_id via
     * story assets media_uuids. Fallback: case-insensitive name/email
     * match to a GuestIdentity in the same room/event.
     */
    private function backfillGuestIdentities(): void
    {
        if (! Schema::hasTable('guest_identities') || ! Schema::hasTable('media')) {
            return;
        }

        $stories = DB::table('stories')
            ->whereNull('guest_identity_id')
            ->select('id', 'room_id', 'event_id', 'guest_name', 'guest_email', 'assets')
            ->get();

        if ($stories->isEmpty()) {
            return;
        }

        // Map media_uuid => guest_identity_id for fast lookup.
        $media = DB::table('media')
            ->whereNotNull('guest_identity_id')
            ->select('uuid', 'guest_identity_id')
            ->get()
            ->keyBy('uuid');

        // Group identities by "room:{id}|event:{id}" + lower(name/email) keys.
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
            }
        }
    }
};
