<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\StoryVisibility;
use App\Http\Controllers\Controller;
use App\Http\Resources\StoryResource;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchController extends Controller
{
    /**
     * Viewer watch feed. Normal stories for any active viewer; VIP stories
     * are pushed first (is_featured) for VIP viewers only.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isVip = $user !== null && $user->canWatchVipStories();

        $normal = Story::with(['user:id,name'])
            ->where('visibility', StoryVisibility::Normal->value)
            ->latest()
            ->take(30)
            ->get();

        $featured = $isVip
            ? Story::with(['user:id,name'])
                ->where('visibility', StoryVisibility::Vip->value)
                ->latest()
                ->take(10)
                ->get()
            : collect();

        return response()->json([
            'data' => StoryResource::collection($normal),
            'featured' => StoryResource::collection($featured),
            'is_vip_viewer' => $isVip,
        ]);
    }

    /**
     * Featured VIP-only feed. Requires an active VIP viewer subscription
     * (enforced by the viewer:vip middleware).
     */
    public function featured(Request $request): JsonResponse
    {
        $stories = Story::with(['user:id,name'])
            ->where('visibility', StoryVisibility::Vip->value)
            ->latest()
            ->take(30)
            ->get();

        return response()->json(['data' => StoryResource::collection($stories)]);
    }
}
