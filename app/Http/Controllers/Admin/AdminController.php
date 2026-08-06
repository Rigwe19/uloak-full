<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\Page;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('admin/dashboard', [
            'title' => 'Admin Dashboard - Ulo of Stories',
            'stats' => [
                'totalUsers' => User::count(),
                'totalRooms' => Room::count(),
                'totalStories' => Story::count(),
                'newEnquiries' => Enquiry::where('status', 'new')->count(),
            ],
            'recentEnquiries' => Enquiry::latest()->take(5)->get(),
        ]);
    }

    public function users(): Response
    {
        return Inertia::render('admin/users', [
            'title' => 'Manage Users - Ulo of Stories',
            'users' => User::latest()->get(),
        ]);
    }

    public function rooms(): Response
    {
        return Inertia::render('admin/rooms', [
            'title' => 'Manage Rooms - Ulo of Stories',
            'rooms' => Room::with('members')->latest()->get(),
        ]);
    }

    public function enquiries(): Response
    {
        return Inertia::render('admin/enquiries', [
            'title' => 'Enquiries - Ulo of Stories',
            'enquiries' => Enquiry::latest()->get(),
        ]);
    }

    public function pages(): Response
    {
        return Inertia::render('admin/pages', [
            'title' => 'Manage Pages - Ulo of Stories',
            'pages' => Page::all(),
        ]);
    }

    public function editPage(Page $page): Response
    {
        return Inertia::render('admin/pages/edit', [
            'title' => ($page->title ?? 'Edit Page').' - Ulo of Stories',
            'page' => $page,
        ]);
    }

    public function memberships(): Response
    {
        return Inertia::render('admin/memberships', [
            'title' => 'Memberships - Ulo of Stories',
            'page' => Page::where('slug', '/membership')->first(),
        ]);
    }

    public function settings(): Response
    {
        return Inertia::render('admin/settings', [
            'title' => 'Admin Settings - Ulo of Stories',
        ]);
    }

    public function updatePage(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|array',
            'is_published' => 'required|boolean',
        ]);

        $page->update($validated);

        return back()->with('success', 'Page updated successfully.');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('uploads', 'public');

            return response()->json([
                'url' => '/storage/'.$path,
            ]);
        }

        return response()->json(['error' => 'Upload failed'], 400);
    }
}
