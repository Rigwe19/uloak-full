<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Person;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DangerZoneController extends Controller
{
    public function show(Request $request): Response
    {
        $person = Person::withTrashed()
            ->where('user_id', $request->user()->id)
            ->first();

        return Inertia::render('settings/danger-zone', [
            'title' => 'Danger Zone - Ulo of Stories',
            'archived' => $person !== null && $person->trashed(),
            'hasPerson' => $person !== null,
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();

        $data = [
            'exported_at' => now()->toIso8601String(),
            'user' => $user->only(['id', 'name', 'email', 'avatar', 'created_at', 'privacy_settings']),
            'person' => $user->person?->toArray(),
            'rooms' => $user->createdRooms()->withCount('stories')->get()->toArray(),
            'stories' => $user->stories()->get()->toArray(),
            'payments' => $user->payments()->get()->toArray(),
            'subscriptions' => $user->subscriptions()->get()->toArray(),
        ];

        $path = storage_path('app/private/exports/ulo-export-'.$user->id.'-'.now()->timestamp.'.json');
        // Ensure directory exists for the JSON sink file.
        if (! file_exists(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }
        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));

        return response()->download($path, 'ulo-export-'.now()->format('Y-m-d').'.json')->deleteFileAfterSend(true);
    }

    public function archive(Request $request): RedirectResponse
    {
        $person = Person::where('user_id', $request->user()->id)->first();

        if (! $person) {
            return back()->withErrors(['archive' => 'No person profile to archive.']);
        }

        $person->delete();

        return back()->with('success', 'Profile archived. You can reactivate it at any time.');
    }

    public function restore(Request $request): RedirectResponse
    {
        $person = Person::withTrashed()->where('user_id', $request->user()->id)->first();

        if (! $person) {
            return back()->withErrors(['archive' => 'No archived profile found.']);
        }

        $person->restore();

        return back()->with('success', 'Profile reactivated.');
    }
}
