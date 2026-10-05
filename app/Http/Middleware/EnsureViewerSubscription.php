<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureViewerSubscription
{
    /**
     * Handle an incoming request.
     *
     * Web watch pages no longer use this middleware (they render a locked
     * discovery view instead of aborting). It remains the guard for JSON
     * API endpoints, where a structured 403 lets mobile clients route
     * the user to the right plan.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $level = 'standard'): Response
    {
        $user = $request->user();

        $allowed = $user !== null && ($level === 'vip'
            ? $user->canWatchVipStories()
            : $user->canWatchNormalStories());

        if (! $allowed) {
            $message = $level === 'vip'
                ? 'A VIP viewer subscription is required.'
                : 'A viewer subscription is required.';

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $message,
                    'requires_subscription' => true,
                    'required_level' => $level === 'vip' ? 'viewer_vip' : 'viewer',
                    'has_subscription' => $user?->canWatchNormalStories() ?? false,
                    'is_vip_viewer' => $user?->canWatchVipStories() ?? false,
                    'pricing_url' => route('pricing'),
                ], 403);
            }

            abort(403, $message);
        }

        return $next($request);
    }
}
