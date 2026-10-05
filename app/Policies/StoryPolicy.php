<?php

namespace App\Policies;

use App\Enums\StoryVisibility;
use App\Models\Story;
use App\Models\User;

class StoryPolicy
{
    /**
     * Viewer gating: normal stories require any active viewer subscription;
     * VIP stories require an active VIP viewer subscription. Owners and the
     * story contributor always pass.
     */
    public function view(?User $user, Story $story): bool
    {
        if ($story->visibility !== StoryVisibility::Vip) {
            if ($user === null) {
                return false;
            }

            if ($story->user_id !== null && $story->user_id === $user->id) {
                return true;
            }

            return $user->canWatchNormalStories();
        }

        if ($user === null) {
            return false;
        }

        if ($story->user_id !== null && $story->user_id === $user->id) {
            return true;
        }

        return $user->canWatchVipStories();
    }

    /**
     * A story may be updated/managed by its contributor, or by the creator
     * of its parent room/event (keepers retagging existing stories).
     * Mirrors the ownership check in Api\V1\StoryController@destroy.
     */
    public function update(User $user, Story $story): bool
    {
        if ($story->user_id !== null && $story->user_id === $user->id) {
            return true;
        }

        $room = $story->room;

        if ($room !== null && $room->created_by === $user->id) {
            return true;
        }

        $event = $story->event;

        if ($event !== null && ($event->created_by ?? null) === $user->id) {
            return true;
        }

        return false;
    }
}
