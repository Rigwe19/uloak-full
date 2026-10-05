<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CreatorType;
use App\Http\Controllers\Controller;
use App\Http\Resources\CreatorProfileResource;
use App\Http\Resources\StoryResource;
use App\Models\CreatorProfile;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
    /**
     * Public creator page by ref code. No auth required so links share well.
     */
    public function show(string $refCode): JsonResponse
    {
        $profile = CreatorProfile::with('user:id,name')
            ->where('ref_code', $refCode)
            ->firstOrFail();

        $stories = Story::where('user_id', $profile->user_id)
            ->where('visibility', 'normal')
            ->latest()
            ->take(12)
            ->get();

        return response()->json([
            'data' => new CreatorProfileResource($profile),
            'stories' => StoryResource::collection($stories),
        ]);
    }

    /**
     * Become a Normal creator (gets a ref link). VIP upgrade is admin-approved.
     */
    public function store(Request $request): JsonResponse
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

        return response()->json([
            'data' => new CreatorProfileResource($profile->load('user')),
            'message' => 'Creator profile ready — share your page link to earn commission.',
        ], $profile->wasRecentlyCreated ? 201 : 200);
    }
}
