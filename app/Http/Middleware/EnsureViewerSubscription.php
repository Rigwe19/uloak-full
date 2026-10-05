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
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $level = 'standard'): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(403, 'A viewer subscription is required.');
        }

        if ($level === 'vip' && ! $user->canWatchVipStories()) {
            abort(403, 'A VIP viewer subscription is required.');
        }

        if ($level !== 'vip' && ! $user->canWatchNormalStories()) {
            abort(403, 'A viewer subscription is required.');
        }

        return $next($request);
    }
}
