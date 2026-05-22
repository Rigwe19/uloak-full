<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class PageController extends Controller
{
    public function welcome()
    {
        $page = Page::where('slug', '/')->first();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'page' => $page,
            'title' => $page?->title ?? 'Home - Uloak, House of Stories',
            'meta_description' => $page?->meta_description ?? 'Uloak helps you preserve your family stories, heritage, and memories for generations to come.',
        ]);
    }

    public function show(string $slug)
    {
        $page = Page::where('slug', '/'.$slug)->first();

        $titles = [
            'about' => 'About Us - Uloak',
            'how-it-works' => 'How It Works - Uloak',
            'legacy-films' => 'Legacy Films - Uloak',
            'community-projects' => 'Community Projects - Uloak',
            'contact' => 'Contact Us - Uloak',
            'privacy' => 'Privacy Policy - Uloak',
            'membership' => 'Membership - Uloak',
        ];

        $descriptions = [
            'about' => 'Learn about Uloak, our mission to preserve human stories, and the people behind the movement.',
            'how-it-works' => 'Learn how Uloak helps you preserve your family heritage and stories.',
            'legacy-films' => 'Documentary-style films for businesses, charities, and social enterprises that want to tell their story with depth and authenticity.',
            'community-projects' => 'Discover the social impact and community projects led by Uloak.',
            'contact' => 'Get in touch with Uloak for storytelling services and collaborations.',
            'privacy' => 'Our commitment to protecting your privacy and family stories.',
            'membership' => 'Join Uloak and start preserving your family stories today.',
        ];

        return Inertia::render($slug, [
            'page' => $page,
            'title' => $page?->title ?? ($titles[$slug] ?? 'Uloak'),
            'meta_description' => $page?->meta_description ?? ($descriptions[$slug] ?? 'Preserve your family stories, heritage, and memories with Uloak.'),
        ]);
    }
}
