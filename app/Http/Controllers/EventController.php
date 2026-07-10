<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\StoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(
        protected StoryService $storyService,
        protected ActivityLogger $activityLogger
    ) {}

    /**
     * Display the specified event with all its stories.
     */
    public function show(Event $event): Response
    {
        $event->load('creator');
        $event->loadCount('stories');

        $paginator = $event->stories()->with('user')->latest()->cursorPaginate(24)->through(fn ($story) => [
            'id' => $story->id,
            'title' => $story->title,
            'thumbnail' => $story->thumbnail,
            'type' => $story->type,
            'description' => $story->description,
            'author' => $story->user->name,
            'tags' => $story->tags ?? [],
            'date' => $story->created_at->format('M d, Y'),
            'file_url' => $story->file_url,
            'assets' => $story->assets ?? [],
        ]);

        return Inertia::render('dashboard/events/show', [
            'title' => $event->name.' - Uloak',
            'meta_description' => $event->description ?? 'Browse memories in this event on Uloak.',
            'event' => $event,
            'stories' => $paginator->items(),
            'pagination' => [
                'next_cursor' => $paginator->nextCursor()?->encode(),
                'path' => $paginator->path(),
                'per_page' => $paginator->perPage(),
            ],
        ]);
    }

    /**
     * Create a new public Event.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'privacy' => ['required', 'string', 'in:public,private'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'event_date' => ['nullable', 'date'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('events/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $event = $request->user()->events()->create($validated);

        $this->activityLogger->log(
            "Created event: {$event->name}",
            Event::class,
            (string) $event->id,
            ['event_name' => $event->name]
        );

        return redirect()->route('dashboard.events.show', $event->slug);
    }

    /**
     * Store a new story inside the specified event.
     */
    public function storeStory(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo,document'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'recording' => ['nullable', 'file'],
            'duration' => ['nullable', 'string'],
            'media_uuids' => ['nullable', 'array'],
            'media_uuids.*' => ['string', 'uuid'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('stories/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $story = $this->storyService->createStory($request->user(), $event, $validated);

        $this->activityLogger->log(
            "Created story in event: {$event->name}",
            Story::class,
            (string) $story->id,
            ['event_id' => $event->id, 'event_name' => $event->name]
        );

        return redirect()->back()->with('success', 'Memory preserved in event successfully.');
    }
}
