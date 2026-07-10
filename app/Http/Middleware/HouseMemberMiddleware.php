<?php

namespace App\Http\Middleware;

use App\Models\HouseMember;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class HouseMemberMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! session()->has('house_member_id')) {
            return redirect()->route('home');
        }

        Inertia::share([
            'house_member' => function () {
                $member = HouseMember::find(session('house_member_id'));

                if (! $member) {
                    return null;
                }

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar' => $member->avatar,
                ];
            },
            'house_owner' => function () {
                $ownerId = session('house_owner_id');

                if (! $ownerId) {
                    return null;
                }

                $owner = User::find($ownerId);

                if (! $owner) {
                    return null;
                }

                return [
                    'house_thumbnail' => $owner->house_thumbnail_url,
                    'house_pattern' => $owner->house_pattern,
                    'house_pattern_upload' => $owner->house_pattern_upload_url,
                ];
            },
        ]);

        return $next($request);
    }
}
