<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, ['google', 'apple', 'facebook']), 404);

        session(['social_login_redirect' => url()->previous()]);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, ['google', 'apple', 'facebook']), 404);

        $socialUser = Socialite::driver($provider)->user();

        $socialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($socialAccount) {
            $user = $socialAccount->user;

            $user->update([
                'avatar' => $user->avatar ?: $socialUser->getAvatar(),
            ]);

            Auth::login($user);

            $redirect = session()->pull('social_login_redirect', route('dashboard'));

            return redirect()->intended($redirect);
        }

        if (Auth::check()) {
            $user = Auth::user();

            $user->socialAccounts()->create([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar_url' => $socialUser->getAvatar(),
            ]);

            if (! $user->avatar) {
                $user->update(['avatar' => $socialUser->getAvatar()]);
            }

            return redirect()->route('dashboard')->with('status', 'Account linked successfully.');
        }

        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            $user->socialAccounts()->create([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar_url' => $socialUser->getAvatar(),
            ]);

            if (! $user->avatar) {
                $user->update(['avatar' => $socialUser->getAvatar()]);
            }

            Auth::login($user);

            $redirect = session()->pull('social_login_redirect', route('dashboard'));

            return redirect()->intended($redirect);
        }

        $user = User::create([
            'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: explode('@', $socialUser->getEmail())[0],
            'email' => $socialUser->getEmail(),
            'password' => bcrypt(Str::password(32)),
            'avatar' => $socialUser->getAvatar(),
            'email_verified_at' => now(),
        ]);

        $user->socialAccounts()->create([
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar_url' => $socialUser->getAvatar(),
        ]);

        Auth::login($user);

        $redirect = session()->pull('social_login_redirect', route('dashboard'));

        return redirect()->intended($redirect);
    }
}
