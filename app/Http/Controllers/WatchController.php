<?php

namespace App\Http\Controllers;

use App\Enums\StoryVisibility;
use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WatchController extends Controller
{
    /**
     * Viewer watch feed. Normal stories for any active viewer; VIP stories
     * are pushed first (featured) for VIP viewers only.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isVip = $user !== null && $user->canWatchVipStories();

        $normal = Story::with(['user:id,name'])
            ->where('visibility', StoryVisibility::Normal->value)
            ->latest()
            ->take(30)
            ->get()
            ->map(fn (Story $s) => $this->present($s, false));

        $featured = $isVip
            ? Story::with(['user:id,name'])
                ->where('visibility', StoryVisibility::Vip->value)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn (Story $s) => $this->present($s, true))
            : collect();

        return Inertia::render('watch/index', [
            'title' => 'Watch | Ulo of Stories',
            'isVipViewer' => $isVip,
            'featured' => $featured,
            'stories' => $normal,
        ]);
    }

    /**
     * Featured VIP-only feed. Pushed VIP stories for VIP viewers.
     */
    public function featured(Request $request): Response
    {
        $user = $request->user();

        $stories = ($user !== null && $user->canWatchVipStories())
            ? Story::with(['user:id,name'])
                ->where('visibility', StoryVisibility::Vip->value)
                ->latest()
                ->take(30)
                ->get()
                ->map(fn (Story $s) => $this->present($s, true))
            : collect();

        return Inertia::render('watch/featured', [
            'title' => 'Featured VIP Stories | Ulo of Stories',
            'stories' => $stories,
        ]);
    }

    /**
     * @return array{id:int,uuid:string,title:string,visibility:string,is_featured:bool,creator:string|null,created_at:string|null}
     */
    protected function present(Story $story, bool $isFeatured): array
    {
        return [
            'id' => $story->id,
            'uuid' => $story->uuid,
            'title' => $story->title,
            'visibility' => $story->visibility->value,
            'is_featured' => $isFeatured,
            'creator' => $story->user?->name,
            'created_at' => $story->created_at?->toDateString(),
        ];
    }
}
