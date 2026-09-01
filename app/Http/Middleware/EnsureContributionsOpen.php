<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureContributionsOpen
{
    /**
     * Block guest contributions when a room's storage is full or its
     * collection window has closed (starter 30 days / expired / manually closed).
     * Returns JSON with a reason so the frontend can show an upgrade prompt.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Room is route-bound as {room} (Room model via slug or id).
        $room = $request->route('room');

        if ($room === null) {
            return $next($request);
        }

        // Legacy rooms (null tier) are always open.
        if (method_exists($room, 'contributionsOpen') && ! $room->contributionsOpen()) {
            $reason = $room->contributionBlockReason() ?? 'closed';

            // Starter 50-contribution limit check (counts stories).
            if ($reason === null && $room->tier_type?->value === 'starter') {
                $limit = (int) config('pricing.tiers.starter.max_contributions', 50);
                if ($room->stories()->count() >= $limit) {
                    $reason = 'contribution_limit';
                }
            }

            if ($reason !== null) {
                $message = match ($reason) {
                    'draft' => 'This room has not been activated yet.',
                    'closed' => 'New contributions are closed for this room.',
                    'expired' => 'The collection period for this room has ended. The owner can still view or upgrade.',
                    'storage_full' => 'This room has reached its storage limit.',
                    'contribution_limit' => 'This room has reached its contribution limit.',
                    default => 'Contributions are currently closed for this room.',
                };

                if ($request->expectsJson() || $request->is('share/*')) {
                    return response()->json([
                        'message' => $message,
                        'reason' => $reason,
                    ], 403);
                }

                abort(403, $message);
            }
        }

        return $next($request);
    }
}
