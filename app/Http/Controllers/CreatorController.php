<?php

namespace App\Http\Controllers;

use App\Enums\CreatorType;
use App\Models\CreatorProfile;
use App\Models\Story;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreatorController extends Controller
{
    /**
     * Public creator page. The subscribe CTA preserves ?ref= so the
     * viewer subscription attributes commission to this creator.
     */
    public function show(string $refCode): Response
    {
        $profile = CreatorProfile::with('user:id,name')
            ->where('ref_code', $refCode)
            ->firstOrFail();

        $stories = Story::where('user_id', $profile->user_id)
            ->where('visibility', 'normal')
            ->latest()
            ->take(12)
            ->get(['id', 'uuid', 'title', 'visibility', 'created_at']);

        return Inertia::render('creators/show', [
            'title' => ($profile->user?->name ?? 'Creator').' | Ulo of Stories',
            'creator' => [
                'name' => $profile->user?->name,
                'ref_code' => $profile->ref_code,
                'creator_type' => $profile->creator_type->value,
                'is_vip' => $profile->isVip(),
            ],
            'stories' => $stories,
        ]);
    }

    /**
     * Become a Normal creator (gets a ref link). VIP upgrade is admin-approved.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'creator_type' => ['nullable', 'string', 'in:normal,vip'],
        ]);

        $type = CreatorType::tryFrom($validated['creator_type'] ?? 'normal') ?? CreatorType::Normal;

        $profile = CreatorProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['creator_type' => $type, 'is_approved_vip' => false],
        );

        if ($profile->wasRecentlyCreated === false && $type === CreatorType::Vip) {
            $profile->update(['creator_type' => $type]);
        }

        return redirect()->back()->with('success', 'Creator profile ready — share your page link to earn commission.');
    }
}
