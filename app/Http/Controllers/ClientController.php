<?php

namespace App\Http\Controllers;

use App\Mail\MagicLinkMail;
use App\Models\Client;
use App\Models\Event;
use App\Models\Room;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function __construct(protected ActivityLogger $activityLogger) {}

    /**
     * List business admin's clients (JSON).
     */
    public function index(): JsonResponse
    {
        $clients = auth()->user()->clients()->latest()->get()->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'email' => $c->email,
            'phone' => $c->phone,
            'company' => $c->company,
            'notes' => $c->notes,
            'access_url' => $c->access_url,
            'created_at' => $c->created_at->format('M d, Y'),
        ]);

        return response()->json(['clients' => $clients]);
    }

    /**
     * Create a new client.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $client = auth()->user()->clients()->create($validated);

        $this->activityLogger->log(
            "Created client: {$client->name}",
            Client::class,
            (string) $client->id,
            ['client_name' => $client->name, 'client_email' => $client->email]
        );

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'company' => $client->company,
                'notes' => $client->notes,
                'access_url' => $client->access_url,
                'created_at' => $client->created_at->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Token-based access for clients — store in session and redirect to invite view.
     */
    public function accessViaToken(string $token): RedirectResponse
    {
        $client = Client::where('access_token', $token)->firstOrFail();
        $business = $client->business;

        session([
            'client_id' => $client->id,
            'client_name' => $client->name,
            'business_user_id' => $business->id,
        ]);

        return redirect()->route('client.dashboard');
    }

    /**
     * Client dashboard showing assigned rooms and events.
     */
    public function dashboard(): Response
    {
        $clientId = session('client_id');
        $businessUserId = session('business_user_id');

        $client = Client::findOrFail($clientId);

        $rooms = $client->rooms()->withCount('stories')->latest()->get();
        $events = $client->events()->withCount('stories')->latest()->get();

        return Inertia::render('client/dashboard', [
            'client_name' => session('client_name'),
            'rooms' => $rooms,
            'events' => $events,
            'title' => 'Client Dashboard - Ulo of Stories',
        ]);
    }

    /**
     * Send a magic link to the client for access.
     */
    public function sendAccessLink(Request $request, Client $client): RedirectResponse
    {
        abort_unless($client->business_user_id === auth()->id(), 403);

        $accessUrl = $client->access_url;

        Mail::to($client->email)->send(new MagicLinkMail(
            $client->name,
            $accessUrl,
            'Your client access link'
        ));

        $this->activityLogger->log(
            "Sent access link to client: {$client->name}",
            Client::class,
            (string) $client->id,
            ['client_email' => $client->email]
        );

        return back()->with('success', 'Access link sent to client.');
    }

    /**
     * Logout client from session.
     */
    public function logout(): RedirectResponse
    {
        session()->forget(['client_id', 'client_name', 'business_user_id']);

        return redirect()->route('home');
    }

    /**
     * Show a single room for the client.
     */
    public function showRoom(Room $room): Response
    {
        $clientId = session('client_id');
        $client = Client::findOrFail($clientId);

        abort_unless($client->rooms()->where('room_id', $room->id)->exists(), 403);

        $room->loadCount('stories');
        $stories = $room->stories()->with('user')->latest()->get()->map(fn ($story) => [
            'uuid' => $story->uuid,
            'id' => $story->id,
            'title' => $story->title,
            'thumbnail' => $story->thumbnail ? Storage::disk('public')->url($story->thumbnail) : null,
            'type' => $story->type,
            'description' => $story->description,
            'author' => $story->user?->name ?? $story->guest_name,
            'date' => $story->created_at->format('M d, Y'),
            'file_url' => $story->file_url ? Storage::disk('public')->url($story->file_url) : null,
            'assets' => $story->assets ?? [],
        ]);

        return Inertia::render('client/rooms/show', [
            'room' => $room,
            'stories' => $stories,
            'title' => $room->name.' - Ulo of Stories',
        ]);
    }

    /**
     * Show a single event for the client.
     */
    public function showEvent(Event $event): Response
    {
        $clientId = session('client_id');
        $client = Client::findOrFail($clientId);

        abort_unless($client->events()->where('event_id', $event->id)->exists(), 403);

        $event->loadCount('stories');
        $stories = $event->stories()->with('user')->latest()->get()->map(function ($story) {
            $thumb = $story->thumbnail;
            if ($thumb && ! str_starts_with($thumb, 'http') && ! str_starts_with($thumb, '/storage')) {
                $thumb = Storage::disk('public')->url(ltrim($thumb, '/'));
            }
            $fileUrl = $story->file_url;
            if ($fileUrl && ! str_starts_with($fileUrl, 'http') && ! str_starts_with($fileUrl, '/storage')) {
                $fileUrl = Storage::disk('public')->url(ltrim($fileUrl, '/'));
            }
            // Enrich assets with full URLs if stored as relative
            $assets = collect($story->assets ?? [])->map(function ($asset) {
                if (isset($asset['url']) && $asset['url'] && ! str_starts_with($asset['url'], 'http') && ! str_starts_with($asset['url'], '/storage')) {
                    $asset['url'] = Storage::disk('public')->url(ltrim($asset['url'], '/'));
                }

                return $asset;
            })->all();

            return [
                'uuid' => $story->uuid,
                'id' => $story->id,
                'title' => $story->title,
                'thumbnail' => $thumb,
                'type' => $story->type,
                'description' => $story->description,
                'author' => $story->user?->name ?? $story->guest_name,
                'date' => $story->created_at->format('M d, Y'),
                'file_url' => $fileUrl,
                'assets' => $assets,
            ];
        });

        return Inertia::render('client/events/show', [
            'event' => $event,
            'stories' => $stories,
            'title' => $event->name.' - Ulo of Stories',
        ]);
    }
}
