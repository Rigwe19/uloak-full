<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Partner;
use App\Models\Room;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class PageController extends Controller
{
    public function welcome()
    {
        $page = Page::where('slug', '/')->first();

        $featuredRooms = Room::whereHas('creator', function ($query) {
            $query->where('is_admin', true);
        })
            ->with(['members', 'creator'])
            ->withCount('stories')
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'page' => $page,
            'title' => $page?->title ?? 'Home - Ulo of Stories',
            'meta_description' => $page?->meta_description ?? 'Ulo of Stories helps you preserve your family stories, heritage, and memories for generations to come.',
            'meta_image' => url('/images/og-image.webp'),
            'featuredRooms' => $featuredRooms,
        ]);
    }

    public function show(string $slug)
    {
        $page = Page::where('slug', '/'.$slug)->first();

        $titles = [
            'about' => 'About Us - Ulo of Stories',
            'how-it-works' => 'How It Works - Ulo of Stories',
            'legacy-films' => 'Legacy Films - Ulo of Stories',
            'community-projects' => 'Community Projects - Ulo of Stories',
            'contact' => 'Contact Us - Ulo of Stories',
            'privacy' => 'Privacy Policy - Ulo of Stories',
            'membership' => 'Membership - Ulo of Stories',
        ];

        $descriptions = [
            'about' => 'Learn about Ulo of Stories, our mission to preserve human stories, and the people behind the movement.',
            'how-it-works' => 'Learn how Ulo of Stories helps you preserve your family heritage and stories.',
            'legacy-films' => 'Documentary-style films for businesses, charities, and social enterprises that want to tell their story with depth and authenticity.',
            'community-projects' => 'Discover the social impact and community projects led by Ulo of Stories.',
            'contact' => 'Get in touch with Ulo of Stories for storytelling services and collaborations.',
            'privacy' => 'Our commitment to protecting your privacy and family stories.',
            'membership' => 'Join Ulo of Stories and start preserving your family stories today.',
        ];

        return Inertia::render($slug, [
            'page' => $page,
            'title' => $page?->title ?? ($titles[$slug] ?? 'Ulo of Stories'),
            'meta_description' => $page?->meta_description ?? ($descriptions[$slug] ?? 'Preserve your family stories, heritage, and memories with Ulo of Stories.'),
            'meta_image' => url('/images/og-image.webp'),
            'meta_url' => url()->current(),
        ]);
    }

    public function weddings(Request $request)
    {
        $pricingService = app(PricingService::class);
        $pricing = $pricingService->allRegionPricing();
        $partners = Partner::where('is_active', true)->get(['name', 'ref_code']);
        $detected = $pricingService->detectRegion($request);
        if (! $request->session()->has('pricing_region')) {
            $request->session()->put('pricing_region', $detected->value);
        } else {
            $detected = $pricingService->resolveRegion($request->session()->get('pricing_region'));
        }

        return Inertia::render('weddings', [
            'title' => 'Ulo Weddings | One Wedding. One Room. Everyone\'s Memories.',
            'meta_description' => 'Bring the photos, videos and stories your guests capture into one Ulo Wedding Room. ₦150,000 one-off per wedding.',
            'meta_image' => url('/images/og-weddings.webp'),
            'meta_url' => url()->current(),
            'pricing' => $pricing,
            'partners' => $partners,
            'defaultRegion' => $detected->value,
        ]);
    }

    public function pricing(Request $request)
    {
        $pricingService = app(PricingService::class);
        $pricing = $pricingService->allRegionPricing();
        $detected = $pricingService->detectRegion($request);
        if (! $request->session()->has('pricing_region')) {
            $request->session()->put('pricing_region', $detected->value);
        } else {
            $detected = $pricingService->resolveRegion($request->session()->get('pricing_region'));
        }

        return Inertia::render('pricing', [
            'title' => 'Pricing | Ulo of Stories',
            'meta_description' => 'Simple pricing for stories that matter. Start free, pay once for a complete occasion, or subscribe for a Family Archive.',
            'meta_image' => url('/images/og-pricing.webp'),
            'meta_url' => url()->current(),
            'pricing' => $pricing,
            'defaultRegion' => $detected->value,
        ]);
    }
}
