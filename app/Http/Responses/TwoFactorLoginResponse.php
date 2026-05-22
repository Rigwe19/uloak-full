<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorLoginResponse implements TwoFactorLoginResponseContract
{
    public function toResponse($request): Response
    {
        $home = $request->user()->is_admin ? '/admin' : '/dashboard';

        if ($request->header('X-Inertia')) {
            return Inertia::render('auth/two-factor-challenge', [
                'title' => 'Two-Factor Authentication - Uloak',
                'doorTransition' => true,
                'doorRedirect' => $home,
            ])->toResponse($request);
        }

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended($home);
    }
}
