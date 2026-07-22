<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    /**
     * Toggle like on a story. Works for both authenticated users and guests.
     */
    public function toggle(Request $request, Story $story): JsonResponse
    {
        $user = Auth::user();

        if ($user) {
            // Authenticated user - use user_id
            $existingLike = Like::where('user_id', $user->id)
                ->where('story_id', $story->id)
                ->first();

            if ($existingLike) {
                $existingLike->delete();
                $isLiked = false;
            } else {
                Like::create([
                    'user_id' => $user->id,
                    'story_id' => $story->id,
                ]);
                $isLiked = true;
            }

            $guestIdentifier = null;
        } else {
            // Guest user (magic link) - use guest_identifier based on email
            $email = $request->input('guest_email');
            if (! $email) {
                return response()->json(['error' => 'Guest email required'], 422);
            }

            // Create unique identifier for guest (hashed email)
            $guestIdentifier = hash('sha256', strtolower($email));

            $existingLike = Like::where('guest_identifier', $guestIdentifier)
                ->where('story_id', $story->id)
                ->first();

            if ($existingLike) {
                $existingLike->delete();
                $isLiked = false;
            } else {
                Like::create([
                    'guest_identifier' => $guestIdentifier,
                    'story_id' => $story->id,
                ]);
                $isLiked = true;
            }
        }

        return response()->json([
            'likes_count' => $story->likes()->count(),
            'is_liked' => $isLiked,
            'guest_identifier' => $guestIdentifier,
        ]);
    }

    /**
     * Check like status for a story.
     */
    public function status(Request $request, Story $story): JsonResponse
    {
        $user = Auth::user();
        $isLiked = false;

        if ($user) {
            $isLiked = Like::where('user_id', $user->id)
                ->where('story_id', $story->id)
                ->exists();
        } else {
            $email = $request->input('guest_email');
            if ($email) {
                $guestIdentifier = hash('sha256', strtolower($email));
                $isLiked = Like::where('guest_identifier', $guestIdentifier)
                    ->where('story_id', $story->id)
                    ->exists();
            }
        }

        return response()->json([
            'likes_count' => $story->likes()->count(),
            'is_liked' => $isLiked,
        ]);
    }
}
