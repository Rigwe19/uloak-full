<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                Fortify::username() => [__('auth.throttle', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)])],
            ])->status(429);
        }

        $user = User::where('email', Str::lower($request->input('email')))->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                Fortify::username() => [__('auth.failed')],
            ]);
        }

        // Two-factor challenge handling for API
        if ($user->two_factor_secret && $user->two_factor_confirmed_at) {
            $code = $request->input('code');
            $recoveryCode = $request->input('recovery_code');

            if (! $code && ! $recoveryCode) {
                return response()->json([
                    'message' => 'Two factor authentication required.',
                    'two_factor' => true,
                ], 423);
            }

            $valid = false;

            if ($recoveryCode) {
                $codes = json_decode(decrypt($user->two_factor_recovery_codes), true) ?? [];

                foreach ($codes as $index => $stored) {
                    if (hash_equals($stored, $recoveryCode)) {
                        $valid = true;
                        // Consume recovery code
                        unset($codes[$index]);
                        $user->forceFill([
                            'two_factor_recovery_codes' => encrypt(json_encode(array_values($codes))),
                        ])->save();

                        break;
                    }
                }
            } elseif ($code) {
                $valid = app(Google2FA::class)->verifyKey(decrypt($user->two_factor_secret), $code);
            }

            if (! $valid) {
                RateLimiter::hit($throttleKey);

                throw ValidationException::withMessages([
                    'code' => [__('The provided two factor authentication code was invalid.')],
                ]);
            }
        }

        RateLimiter::clear($throttleKey);

        $tokenName = $request->input('device_name', $request->header('User-Agent', 'mobile'));
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'data' => new UserResource($user),
            'token' => $token,
            'message' => 'Authenticated.',
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user = app(CreateNewUser::class)->create($request->only('name', 'email', 'password', 'password_confirmation'));

        $tokenName = $request->input('device_name', $request->header('User-Agent', 'mobile'));
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'data' => new UserResource($user),
            'token' => $token,
            'message' => 'Registered.',
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}
