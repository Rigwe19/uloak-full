<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Handle the global search.
     */
    public function index(Request $request): Response
    {
        $query = $request->input('q');

        $rooms = [];
        $stories = [];

        if ($query) {
            $rooms = Room::where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->with('members')
                ->get();

            $stories = Story::where('title', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->with(['user', 'room'])
                ->get();
        }

        return Inertia::render('dashboard/search', [
            'title' => 'Search - Ulo of Stories',
            'results' => [
                'rooms' => $rooms,
                'stories' => $stories,
            ],
            'query' => $query,
        ]);
    }
}
