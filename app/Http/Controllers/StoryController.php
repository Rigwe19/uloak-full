<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Story;
use App\Services\StoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoryController extends Controller
{
    public function __construct(
        protected StoryService $storyService
    ) {}

    /**
     * Store a new story.
     */
    public function store(Request $request, Room $room)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo,document'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
            'recording' => ['nullable', 'file'],
            'duration' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('stories/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $this->storyService->createStory($request->user(), $room, $validated);

        return redirect()->back()->with('success', 'Memory preserved successfully.');
    }

    /**
     * Display the specified story.
     */
    public function show(Story $story): Response
    {
        $story->load(['user', 'room', 'event']);

        $nextStory = Story::where('room_id', $story->room_id)
            ->where('event_id', $story->event_id)
            ->where('id', '>', $story->id)
            ->first();

        $prevStory = Story::where('room_id', $story->room_id)
            ->where('event_id', $story->event_id)
            ->where('id', '<', $story->id)
            ->orderBy('id', 'desc')
            ->first();

        return Inertia::render('dashboard/stories/show', [
            'title' => $story->title.' - Uloak',
            'meta_description' => $story->description ?? 'A memory preserved on Uloak.',
            'story' => [
                'id' => $story->id,
                'title' => $story->title,
                'description' => $story->description,
                'type' => $story->type,
                'thumbnail' => $story->thumbnail,
                'author' => $story->user->name,
                'date' => $story->created_at->format('M d, Y'),
                'tags' => $story->tags ?? [],
                'assets' => $story->assets ?? [],
                'fileUrl' => $story->file_url,
                'transcript' => $story->transcript ?? [],
                'comments' => $story->comments()->with('user')->latest()->get()->map(fn ($comment) => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'author' => $comment->user->name,
                    'date' => $comment->created_at->diffForHumans(),
                ]),
            ],
            'room' => $story->room ? [
                'id' => $story->room->id,
                'slug' => $story->room->slug,
                'name' => $story->room->name,
            ] : null,
            'event' => $story->event ? [
                'id' => $story->event->id,
                'slug' => $story->event->slug,
                'name' => $story->event->name,
            ] : null,
            'nextStoryId' => $nextStory?->id,
            'prevStoryId' => $prevStory?->id,
        ]);
    }

    /**
     * Add an asset to the story.
     */
    public function addAsset(Request $request, Story $story)
    {
        $validated = $request->validate([
            'file' => ['nullable', 'file', 'max:51200'],
            'recording' => ['nullable', 'file', 'max:51200'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $file = $request->file('file') ?? $request->file('recording');

        if (! $file) {
            return redirect()->back()->withErrors(['file' => 'Asset file is required.']);
        }

        $path = $file->store('stories/'.$story->room_id.'/assets', 'public');
        $url = Storage::url($path);

        $mime = $file->getMimeType();
        $type = 'photo';
        if ($mime === 'application/pdf') {
            $type = 'pdf';
        } elseif (str_contains($mime, 'video')) {
            $type = 'video';
        } elseif (str_contains($mime, 'audio')) {
            $type = 'audio';
        }

        $assets = $story->assets ?? [];
        $assets[] = [
            'url' => $url,
            'type' => $type,
            'title' => $validated['title'] ?? $file->getClientOriginalName(),
        ];

        $story->update(['assets' => $assets, 'type' => 'collection']);

        return redirect()->back()->with('success', 'Asset added to collection.');
    }
}
