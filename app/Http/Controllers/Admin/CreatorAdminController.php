<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CreatorEarning;
use App\Models\CreatorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreatorAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/creators', [
            'title' => 'Creators - Ulo of Stories',
            'profiles' => CreatorProfile::with('user:id,name,email')->latest()->take(100)->get(),
            'earnings' => CreatorEarning::with('creatorProfile.user:id,name')->latest()->take(100)->get(),
        ]);
    }

    public function approve(CreatorProfile $profile): JsonResponse
    {
        $profile->update(['creator_type' => 'vip', 'is_approved_vip' => true]);

        return response()->json(['message' => 'Creator approved as VIP.']);
    }

    public function revoke(CreatorProfile $profile): JsonResponse
    {
        $profile->update(['creator_type' => 'normal', 'is_approved_vip' => false]);

        return response()->json(['message' => 'VIP status revoked.']);
    }

    public function markPaid(Request $request, CreatorEarning $earning): JsonResponse
    {
        $request->validate([]);

        $earning->update(['status' => 'paid', 'paid_at' => now()]);

        return response()->json(['message' => 'Earning marked as paid.']);
    }
}
