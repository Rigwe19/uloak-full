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
     * Viewer watch feed. Public by design:
     * - Active viewers see the full feed (VIP stories pushed first for VIP viewers).
     * - Guests and members without a viewer subscription see a locked
     *   discovery view (titles + creators only, upgrade/sign-in CTAs) —
     *   never a 403 page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user !== null && $user->canWatchNormalStories()) {
            $isVip = $user->canWatchVipStories();

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
                'locked' => false,
                'isGuest' => false,
                'isVipViewer' => $isVip,
                'featured' => $featured,
                'stories' => $normal,
                'teasers' => [],
                'stats' => $this->stats(),
            ]);
        }

        return Inertia::render('watch/index', [
            'title' => 'Watch | Ulo of Stories',
            'locked' => true,
            'isGuest' => $user === null,
            'isVipViewer' => false,
            'featured' => [],
            'stories' => [],
            'teasers' => $this->teasers(),
            'stats' => $this->stats(),
        ]);
    }

    /**
     * Featured VIP feed. Public by design: VIP viewers see the full feed,
     * everyone else sees a locked VIP discovery view with a VIP upsell —
     * never a 403 page.
     */
    public function featured(Request $request): Response
    {
        $user = $request->user();

        if ($user !== null && $user->canWatchVipStories()) {
            $stories = Story::with(['user:id,name'])
                ->where('visibility', StoryVisibility::Vip->value)
                ->latest()
                ->take(30)
                ->get()
                ->map(fn (Story $s) => $this->present($s, true));

            return Inertia::render('watch/featured', [
                'title' => 'Featured VIP Stories | Ulo of Stories',
                'locked' => false,
                'isGuest' => false,
                'stories' => $stories,
                'teasers' => [],
                'stats' => $this->stats(),
            ]);
        }

        return Inertia::render('watch/featured', [
            'title' => 'Featured VIP Stories | Ulo of Stories',
            'locked' => true,
            'isGuest' => $user === null,
            'stories' => [],
            'teasers' => $this->teasers(onlyVip: true),
            'stats' => $this->stats(),
        ]);
    }

    /**
     * Locked discovery teasers: titles + creators only, never media.
     *
     * @return array<int, array{id:int,uuid:string,title:string,visibility:string,is_featured:bool,creator:string|null,created_at:string|null}>
     */
    protected function teasers(bool $onlyVip = false): array
    {
        $query = Story::with(['user:id,name'])->latest()->take(12);

        if ($onlyVip) {
            $query->where('visibility', StoryVisibility::Vip->value);
        }

        return $query->get()
            ->map(fn (Story $s) => $this->present($s, $s->visibility === StoryVisibility::Vip))
            ->all();
    }

    /**
     * @return array{normal:int,vip:int}
     */
    protected function stats(): array
    {
        return [
            'normal' => Story::where('visibility', StoryVisibility::Normal->value)->count(),
            'vip' => Story::where('visibility', StoryVisibility::Vip->value)->count(),
        ];
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
