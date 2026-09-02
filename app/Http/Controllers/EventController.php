<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Media;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\StoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use ZipArchive;

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
        $stories = $event->stories()
            ->with('media')
            ->latest()
            ->get();

        return Inertia::render('dashboard/events/show', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'description' => $event->description,
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'location' => $event->location,
                'created_at' => $event->created_at->format('M d, Y'),
            ],
            'stories' => $stories->map(fn ($story) => [
                'id' => $story->id,
                'uuid' => $story->uuid,
                'title' => $story->title,
                'description' => $story->description,
                'type' => $story->type,
                'thumbnail' => Storage::disk('public')->url($story->thumbnail),
                'file_url' => Storage::disk('public')->url($story->file_url),
                'duration' => $story->duration,
                'assets' => $story->assets,
                'created_at' => $story->created_at->format('M d, Y'),
                'user' => $story->user?->name,
            ]),
            'clients' => $event->clients->map(fn ($client) => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
            ]),
        ]);
    }

    /**
     * Delete an event with all its stories and associated media.
     */
    public function destroy(Event $event): RedirectResponse
    {
        // Delete all stories with their media
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

        $this->activityLogger->log(
            "Deleted event: {$event->name}",
            Event::class,
            (string) $event->id,
            ['event_name' => $event->name]
        );

        return redirect()->route('dashboard')->with('success', 'Event and all associated memories deleted.');
    }

    /**
     * Download all media from an event as a ZIP file.
     */
    public function downloadMedia(Event $event)
    {
        $stories = $event->stories;
        $files = [];

        foreach ($stories as $story) {
            $storyPrefix = 'story_'.$story->id.'_';
            $media = $story->media;

            if ($media) {
                $localPath = $this->storyService->downloadMedia($media);
                if ($localPath) {
                    $files[$storyPrefix.$media->original_name] = $localPath;
                }
            }

            if ($story->type === 'collection' && $story->assets) {
                foreach ($story->assets as $asset) {
                    if (isset($asset['media_uuid'])) {
                        $assetMedia = Media::where('uuid', $asset['media_uuid'])->first();
                        if ($assetMedia) {
                            $localPath = $this->storyService->downloadMedia($assetMedia);
                            if ($localPath) {
                                $files[$storyPrefix.'_'.$assetMedia->original_name] = $localPath;
                            }
                        }
                    }
                }
            }
        }

        if (empty($files)) {
            return back()->with('error', 'No media files found for this event.');
        }

        $zip = new ZipArchive;
        $zipName = 'event_'.$event->slug.'_media_'.now()->format('Y_m_d_H_i_s').'.zip';
        $zipPath = storage_path('app/temp/'.$zipName);

        if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
            return back()->with('error', 'Could not create ZIP file.');
        }

        foreach ($files as $name => $path) {
            $zip->addFile($path, $name);
        }

        $zip->close();

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request): RedirectResponse
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

        $this->activityLogger->log(
            "Created event: {$event->name}",
            Event::class,
            (string) $event->id,
            ['event_name' => $event->name]
        );

        return redirect()->route('dashboard.events.show', $event->slug);
    }

    /**
     * Store a new story for an event.
     */
    public function storeStory(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:video,audio,photo,document,collection'],
            'files' => ['nullable', 'array'],
            'files.*' => ['file', 'max:51200'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
            'recording' => ['nullable', 'file'],
            'duration' => ['nullable', 'string'],
            'media_uuids' => ['nullable', 'array'],
            'media_uuids.*' => ['uuid', 'exists:media,uuid'],
        ]);

        $story = $this->storyService->createStory(auth()->user(), $event, $validated);

        $this->activityLogger->log(
            "Created story: {$story->title}",
            Story::class,
            (string) $story->id,
            ['event_id' => $event->id]
        );

        return redirect()->back()->with('success', 'Memory preserved successfully.');
    }
}
