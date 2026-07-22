<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('client_id')) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
