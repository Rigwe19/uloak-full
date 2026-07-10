<?php

namespace App\Http\Controllers;

use App\Mail\HouseMemberInvitation;
use App\Models\HouseMember;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HouseMemberController extends Controller
{
    public function __construct(
        protected ActivityLogger $activityLogger
    ) {}

    public function edit(): Response
    {
        $user = auth()->user();

        return Inertia::render('settings/house', [
            'title' => 'House Settings - Uloak',
            'house' => [
                'thumbnail' => $user->house_thumbnail_url,
                'pattern' => $user->house_pattern,
                'pattern_upload' => $user->house_pattern_upload_url,
            ],
        ]);
    }

    public function updateThumbnail(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $request->validate(['thumbnail' => ['required', 'image', 'max:5120']]);

        if ($user->house_thumbnail) {
            Storage::disk('public')->delete($user->house_thumbnail);
        }

        $path = $request->file('thumbnail')->store('house-thumbnails', 'public');
        $user->update(['house_thumbnail' => $path]);

        return back()->with('success', 'House thumbnail updated.');
    }

    public function updatePattern(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'pattern' => ['nullable', 'string', 'max:50'],
        ]);

        $data = ['house_pattern' => $validated['pattern'] ?: null];

        if ($user->house_pattern_upload) {
            Storage::disk('public')->delete($user->house_pattern_upload);
            $data['house_pattern_upload'] = null;
        }

        $user->update($data);

        return back()->with('success', 'House pattern updated.');
    }

    public function updatePatternUpload(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $request->validate(['pattern_image' => ['required', 'image', 'max:5120']]);

        if ($user->house_pattern_upload) {
            Storage::disk('public')->delete($user->house_pattern_upload);
        }

        $path = $request->file('pattern_image')->store('house-patterns', 'public');
        $user->update([
            'house_pattern_upload' => $path,
            'house_pattern' => null,
        ]);

        return back()->with('success', 'House pattern image uploaded.');
    }

    public function clearPatternUpload(): RedirectResponse
    {
        $user = auth()->user();

        if ($user->house_pattern_upload) {
            Storage::disk('public')->delete($user->house_pattern_upload);
        }

        $user->update(['house_pattern_upload' => null]);

        return back()->with('success', 'Pattern image removed.');
    }

    public function index(): JsonResponse
    {
        $members = auth()->user()->houseMembers()->latest()->get()->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'position' => $m->position,
            'access_url' => route('house.access', $m->access_token),
            'created_at' => $m->created_at->format('M d, Y'),
        ]);

        return response()->json(['members' => $members]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'position' => ['nullable', 'string', 'max:100'],
        ]);

        $exists = auth()->user()->houseMembers()->where('email', $validated['email'])->exists();

        if ($exists) {
            return back()->with('error', 'A house member with this email already exists.');
        }

        $member = auth()->user()->houseMembers()->create($validated);

        $this->activityLogger->log(
            "Added house member: {$member->name} ({$member->email})",
            HouseMember::class,
            (string) $member->id,
            ['member_name' => $member->name, 'member_email' => $member->email]
        );

        $accessUrl = route('house.access', $member->access_token);
        $ownerName = auth()->user()->name;

        Mail::to($member->email)->send(
            new HouseMemberInvitation(
                memberName: $member->name,
                accessUrl: $accessUrl,
                ownerName: $ownerName,
            )
        );

        return back()->with('success', 'House member added! An invitation has been sent to their email.');
    }

    public function destroy(HouseMember $member): RedirectResponse
    {
        abort_unless($member->owner_id === auth()->id(), 403);

        $member->delete();

        $this->activityLogger->log(
            "Removed house member: {$member->name} ({$member->email})",
            HouseMember::class,
            (string) $member->id,
            ['member_name' => $member->name, 'member_email' => $member->email]
        );

        return back()->with('success', 'House member removed.');
    }

    public function regenerateToken(HouseMember $member): RedirectResponse
    {
        abort_unless($member->owner_id === auth()->id(), 403);

        $member->regenerateToken();

        $accessUrl = route('house.access', $member->access_token);

        return back()->with('success', 'New access link generated: '.$accessUrl);
    }
}
