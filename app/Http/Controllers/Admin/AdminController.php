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

    public function toggleUserAdmin(Request $request, User $user)
    {
        abort_unless($request->user()->is_admin, 403);

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot demote yourself.']);
        }

        if ($user->is_admin && User::where('is_admin', true)->count() <= 1) {
            return back()->withErrors(['user' => 'Cannot demote the last admin.']);
        }

        $user->update(['is_admin' => ! (bool) $user->is_admin]);

        return back()->with('success', $user->is_admin ? 'User promoted to admin.' : 'Admin demoted to user.');
    }

    public function destroyUser(Request $request, User $user)
    {
        abort_unless($request->user()->is_admin, 403);

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete yourself.']);
        }

        if ($user->is_admin && User::where('is_admin', true)->count() <= 1) {
            return back()->withErrors(['user' => 'Cannot delete the last admin.']);
        }

        $user->delete();

        return back()->with('success', 'User deleted.');
    }

    public function destroyRoom(Request $request, Room $room)
    {
        abort_unless($request->user()->is_admin, 403);

        $room->delete();

        return back()->with('success', 'Room deleted.');
    }

    public function updateEnquiryStatus(Request $request, Enquiry $enquiry)
    {
        abort_unless($request->user()->is_admin, 403);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:new,read,closed'],
        ]);

        $enquiry->update($validated);

        return back()->with('success', 'Enquiry updated.');
    }

    public function destroyEnquiry(Request $request, Enquiry $enquiry)
    {
        abort_unless($request->user()->is_admin, 403);

        $enquiry->delete();

        return back()->with('success', 'Enquiry deleted.');
    }

    public function downloadReport(Request $request)
    {
        abort_unless($request->user()->is_admin, 403);

        $rows = [
            ['metric', 'value'],
            ['totalUsers', User::count()],
            ['totalRooms', Room::count()],
            ['totalStories', Story::count()],
            ['newEnquiries', Enquiry::where('status', 'new')->count()],
            ['generated_at', now()->toIso8601String()],
        ];

        $csv = collect($rows)->map(fn ($row) => implode(',', $row))->implode("\n");

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="ulo-report-'.now()->format('Y-m-d').'.csv"',
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
