<?php

namespace App\Http\Responses;

use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): Response
    {
        $home = $request->user()->is_admin ? '/admin' : '/dashboard';

        if ($request->header('X-Inertia')) {
            return Inertia::render('auth/register', [
                'passwordRules' => Password::defaults()->toPasswordRulesString(),
                'doorTransition' => true,
                'doorRedirect' => $home,
            ])->toResponse($request);
        }

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended($home);
    }
}
