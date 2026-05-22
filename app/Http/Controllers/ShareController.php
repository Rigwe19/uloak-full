<?php

namespace App\Http\Controllers;

use App\Mail\MagicLinkMail;
use App\Models\Event;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ShareController extends Controller
{
    /**
     * Show the welcome screen for sharing a Room with a guest.
     */
    public function showRoom(string $slug): RedirectResponse|InertiaResponse
    {
        $room = Room::where('slug', $slug)->firstOrFail();

        if (Auth::check()) {
            return redirect()->route('dashboard.rooms.show', $room->slug);
        }

        return Inertia::render('share/welcome', [
            'type' => 'room',
            'space' => [
                'name' => $room->name,
                'slug' => $room->slug,
                'description' => $room->description,
                'thumbnail' => $room->thumbnail,
            ],
        ]);
    }

    /**
     * Show the welcome screen for sharing an Event with a guest.
     */
    public function showEvent(string $slug): RedirectResponse|InertiaResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (Auth::check()) {
            return redirect()->route('dashboard.events.show', $event->slug);
        }

        return Inertia::render('share/welcome', [
            'type' => 'event',
            'space' => [
                'name' => $event->name,
                'slug' => $event->slug,
                'description' => $event->description,
                'thumbnail' => $event->thumbnail,
            ],
        ]);
    }

    /**
     * Generate and send the magic login link via email.
     */
    public function sendMagicLink(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'type' => ['required', 'string', 'in:room,event'],
            'slug' => ['required', 'string'],
        ]);

        $space = $validated['type'] === 'room'
            ? Room::where('slug', $validated['slug'])->firstOrFail()
            : Event::where('slug', $validated['slug'])->firstOrFail();

        // Create or locate the user
        $user = User::firstOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'password' => Hash::make(Str::random(32)),
            ]
        );

        // Generate the redirection URL
        $redirectUrl = $validated['type'] === 'room'
            ? route('dashboard.rooms.show', $space->slug)
            : route('dashboard.events.show', $space->slug);

        // Generate the signed temporary magic login route (expires in 30 minutes)
        $magicUrl = URL::temporarySignedRoute(
            'magic.login',
            now()->addMinutes(30),
            [
                'email' => $user->email,
                'redirect' => $redirectUrl,
            ]
        );

        // Dispatch the email
        Mail::to($user->email)->send(new MagicLinkMail($user->name, $magicUrl, $space->name));

        return back()->with('success', 'A secure magic link has been sent to your email. Check your inbox to enter.');
    }

    /**
     * Handle the temporary signed magic login route.
     */
    public function magicLogin(Request $request): RedirectResponse
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Invalid or expired magic link.');
        }

        $user = User::where('email', $request->email)->firstOrFail();

        Auth::login($user, true);

        $redirect = $request->input('redirect', route('dashboard'));

        return redirect($redirect);
    }
}
