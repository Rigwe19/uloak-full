<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Media;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\PersonArchiveService;
use App\Services\PersonScope;
use App\Services\StoryService;
use App\Support\MediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function __construct(
        protected StoryService $storyService,
        protected ActivityLogger $activityLogger,
        protected PersonScope $personScope,
        protected PersonArchiveService $personArchive
    ) {}

    public function index(Request $request): JsonResponse
    {
        $events = Event::where('created_by', $request->user()->id)->withCount('stories')->latest()->paginate(20);

        $events->getCollection()->transform(function ($event) {
            $event->thumbnail = $event->thumbnail ? MediaUrl::resolve($event->thumbnail, request()) : null;

            return $event;
        });

        return response()->json(['data' => $events]);
    }

    public function show(Event $event): JsonResponse
    {
        $stories = $this->personArchive->enrichStoriesWithPeople(
            $event->stories()->with(['user'])->latest()->limit(24)->get()
        );

        $stories->transform(function ($story) {
            $story->thumbnail = MediaUrl::resolve($story->thumbnail, request());
            $story->file_url = MediaUrl::resolve($story->file_url, request());

            return $story;
        });

        $event->thumbnail = $event->thumbnail ? MediaUrl::resolve($event->thumbnail, request()) : null;

        return response()->json([
            'data' => [
                'event' => $event->loadCount('stories'),
                'stories' => $stories,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'privacy' => ['required', 'string', 'in:public,private'],
            'event_date' => ['nullable', 'date'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('events/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $validated['created_by'] = $request->user()->id;
        $event = Event::create($validated);

        $this->activityLogger->log("Created event: {$event->name}", Event::class, (string) $event->id, ['event_name' => $event->name]);

        return response()->json(['data' => $event], 201);
    }

    public function destroy(Event $event): JsonResponse
    {
        $stories = $event->stories;
        foreach ($stories as $story) {
            foreach ($story->assets ?? [] as $asset) {
                if (isset($asset['media_uuid'])) {
                    $media = Media::where('uuid', $asset['media_uuid'])->first();
                    if ($media) {
                        $this->storyService->deleteMedia($media);
                    }
                }
            }
            $story->delete();
        }

        $event->delete();

        $this->activityLogger->log("Deleted event: {$event->name}", Event::class, (string) $event->id, ['event_name' => $event->name]);

        return response()->json(['message' => 'Event deleted.']);
    }

    public function storeStory(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo,document,collection'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:1048576'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'recording' => ['nullable', 'file'],
            'duration' => ['nullable', 'string'],
            'media_uuids' => ['nullable', 'array'],
            'media_uuids.*' => ['uuid', 'exists:media,uuid'],
            'person_ids' => ['nullable', 'array'],
            'person_ids.*' => ['integer', 'exists:people,id'],
        ]);

        $story = $this->storyService->createStory(auth()->user(), $event, $validated);

        $this->activityLogger->log(
            "Created story: {$story->title}",
            Story::class,
            (string) $story->id,
            ['event_id' => $event->id]
        );

        return response()->json(['data' => $story], 201);
    }
}
