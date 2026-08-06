<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Room;
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
}
