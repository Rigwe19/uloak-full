<?php

namespace App\Services;

use App\Enums\RoomStatus;
use App\Enums\RoomTier;
use App\Models\Room;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class RoomService
{
    public function __construct() {}

    public function getRoomDetails(Room $room): Room
    {
        return $room->load(['members', 'stories.user', 'stories.room', 'creator', 'tributes']);
    }

    /**
     * Create a room with tier enforcement.
     * - tier_type defaults to starter; caller passes tier_type in $data to request another tier.
     * - starter: enforces 1 active starter per owner → assigns 1GB / +30d / active.
     * - full_room / family_archive: rejected here — must go via WeddingsController (draft→payment→activate) or Subscription (archive). This keeps the paywall single-sourced.
     */
    public function createRoom(User $owner, array $data, ?RoomTier $forcedTier = null): Room
    {
        $tier = $forcedTier
            ?? RoomTier::tryFrom($data['tier_type'] ?? RoomTier::Starter->value)
            ?? RoomTier::Starter;

        // Never trust tier_type from mass-assigned data.
        unset($data['tier_type']);

        // Paywall: only "general" stays free (Starter). Wedding, birthday, burial, memorial, anniversary, graduation all require a paid Full Room.
        $paywalledTypes = ['wedding', 'birthday', 'burial', 'memorial', 'anniversary', 'graduation'];
        if (in_array($data['room_type'] ?? null, $paywalledTypes, true) && $tier === RoomTier::Starter) {
            $msg = ($data['room_type'] ?? null) === 'wedding'
                ? 'Wedding Rooms require a paid Full Room. Start yours at /weddings — ₦150,000 one-off.'
                : 'This Room type requires a Full Room purchase. See /pricing.';
            throw ValidationException::withMessages(['room_type' => $msg]);
        }

        if ($tier === RoomTier::Starter) {
            $activeStarterExists = Room::where('created_by', $owner->id)
                ->where('tier_type', RoomTier::Starter->value)
                ->where('status', RoomStatus::Active->value)
                ->exists();

            if ($activeStarterExists) {
                throw ValidationException::withMessages([
                    'tier_type' => 'You already have an active Starter Room. Upgrade it or wait for it to expire before creating another. See /pricing.',
                ]);
            }

            $data['tier_type'] = RoomTier::Starter->value;
            $data['status'] = RoomStatus::Active->value;
            $data['storage_limit_bytes'] = config('pricing.tiers.starter.storage_bytes');
            $data['storage_used_bytes'] = 0;
            $data['expires_at'] = now()->addDays((int) config('pricing.tiers.starter.collection_days', 30));
            $data['contributions_closed_at'] = null;
        } elseif ($tier === RoomTier::FullRoom) {
            throw ValidationException::withMessages([
                'tier_type' => 'Full Rooms require payment. Create yours at /weddings/create or /pricing.',
            ]);
        } elseif ($tier === RoomTier::FamilyArchive) {
            throw ValidationException::withMessages([
                'tier_type' => 'Family Archives require an active subscription. See /pricing.',
            ]);
        }

        $room = $owner->createdRooms()->create($data);
        $room->members()->attach($owner);

        return $room;
    }
}
