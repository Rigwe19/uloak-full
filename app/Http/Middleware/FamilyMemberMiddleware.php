<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FamilyMemberMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('family_member_id')) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
