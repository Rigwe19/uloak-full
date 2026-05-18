<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class PageController extends Controller
{
    public function welcome()
    {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'page' => Page::where('slug', '/')->first(),
        ]);
    }

    public function show(string $slug)
    {
        $page = Page::where('slug', '/'.$slug)->first();

        // Fallback to static if not in DB, but prefer DB
        return Inertia::render($slug, [
            'page' => $page,
        ]);
    }
}
