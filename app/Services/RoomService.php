<?php

namespace App\Services;

use App\Models\Room;
use App\Models\User;

class RoomService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getRoomDetails(Room $room): Room
    {
        return $room->load(['members', 'stories.user', 'stories.room', 'creator']);
    }

    public function createRoom(User $user, array $data): Room
    {
        $room = $user->createdRooms()->create($data);
        $room->members()->attach($user);

        return $room;
    }
}
