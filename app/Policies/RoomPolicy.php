<?php

namespace App\Policies;

use App\Models\Room;
use App\Models\User;

class RoomPolicy
{
    /**
     * Determine whether the user can view the room.
     * Allowed if the user created the room or is a member of it.
     */
    public function view(User $user, Room $room): bool
    {
        return $room->created_by === $user->id
            || $room->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the room.
     * Allowed if the user created the room or is a member of it.
     */
    public function update(User $user, Room $room): bool
    {
        return $room->created_by === $user->id
            || $room->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can delete the room.
     * Only the room creator can delete.
     */
    public function delete(User $user, Room $room): bool
    {
        return $room->created_by === $user->id;
    }

    /**
     * Determine whether the user can manage the room (members, settings, etc).
     * Only the room creator can manage.
     */
    public function manage(User $user, Room $room): bool
    {
        return $room->created_by === $user->id;
    }
}
