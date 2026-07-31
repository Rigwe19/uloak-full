<?php

namespace App\Http\Controllers;

use App\Media\Cloudinary\CloudinaryService;
use App\Models\Client;
use App\Models\Event;
use App\Models\Media;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\StoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
        $event->load('creator');
        $event->loadCount('stories');

        $paginator = $event->stories()->with('user')->latest()->cursorPaginate(24)->through(fn ($story) => [
            'uuid' => $story->uuid,
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
            'allow_download' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('events/thumbnails', 'public');
            $validated['thumbnail'] = Storage::url($path);
        }

        $event = $request->user()->events()->create($validated);

        // Attach client if specified (business admin)
        if ($request->filled('client_id')) {
            $client = Client::find($request->input('client_id'));
            if ($client && $client->business_user_id === $request->user()->id) {
                $event->clients()->syncWithoutDetaching([$client->id]);
            }
        }

        $this->activityLogger->log(
            "Created event: {$event->name}",
            Event::class,
            (string) $event->id,
            ['event_name' => $event->name]
        );

        return redirect()->route('dashboard.events.show', $event->slug);
    }

    /**
     * Delete an event with all its stories and associated Cloudinary media.
     */
    public function destroy(Event $event, CloudinaryService $cloudinary): RedirectResponse
    {
        // Delete all stories with their Cloudinary resources
        $stories = $event->stories;
        foreach ($stories as $story) {
            $this->deleteStoryCloudinaryResources($story, $cloudinary);
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

            // Collect file_url
            if (! empty($story->file_url)) {
                $content = $this->fetchUrlContent($story->file_url);
                if ($content) {
                    $ext = pathinfo(parse_url($story->file_url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'bin';
                    $files[] = [
                        'content' => $content,
                        'name' => $storyPrefix.'main.'.$ext,
                    ];
                }
            }

            // Collect assets
            if (! empty($story->assets)) {
                foreach ($story->assets as $index => $asset) {
                    $assetUrl = $asset['url'] ?? null;
                    if ($assetUrl) {
                        $content = $this->fetchUrlContent($assetUrl);
                        if ($content) {
                            $ext = pathinfo(parse_url($assetUrl, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'bin';
                            $files[] = [
                                'content' => $content,
                                'name' => $storyPrefix.'asset_'.($index + 1).'.'.$ext,
                            ];
                        }
                    }
                }
            }

            // Collect thumbnail
            if (! empty($story->thumbnail) && $story->thumbnail !== $story->file_url) {
                $content = $this->fetchUrlContent($story->thumbnail);
                if ($content) {
                    $ext = pathinfo(parse_url($story->thumbnail, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                    $files[] = [
                        'content' => $content,
                        'name' => $storyPrefix.'thumbnail.'.$ext,
                    ];
                }
            }
        }

        if (empty($files)) {
            return back()->with('error', 'No media files found in this event.');
        }

        $sanitizedName = Str::slug($event->name, '_');
        $zipFilename = "{$sanitizedName}_media.zip";
        $zipPath = storage_path("app/{$zipFilename}");

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return back()->with('error', 'Could not create ZIP file.');
        }

        foreach ($files as $file) {
            $zip->addFromString($file['name'], $file['content']);
        }
        $zip->close();

        return response()->download($zipPath, $zipFilename, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Fetch content from a URL (supports Cloudinary and local URLs).
     */
    protected function fetchUrlContent(string $url): ?string
    {
        try {
            $context = stream_context_create([
                'http' => [
                    'timeout' => 30,
                    'user_agent' => 'Uloak/1.0',
                ],
                'ssl' => [
                    'verify_peer' => false,
                ],
            ]);

            $content = @file_get_contents($url, false, $context);

            return $content !== false ? $content : null;
        } catch (\Throwable $e) {
            logger()->warning('Failed to fetch URL content for download', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Delete all Cloudinary resources associated with a story.
     */
    protected function deleteStoryCloudinaryResources(Story $story, CloudinaryService $cloudinary): void
    {
        if ($story->assets) {
            foreach ($story->assets as $asset) {
                if (isset($asset['media_uuid'])) {
                    $media = Media::where('uuid', $asset['media_uuid'])->first();
                    if ($media && $media->cloudinary_public_id) {
                        $cloudinary->deleteResource($media->cloudinary_public_id);
                        $media->delete();
                    }
                }
                if (isset($asset['url']) && str_contains($asset['url'], 'cloudinary')) {
                    $publicId = CloudinaryService::extractPublicIdFromUrl($asset['url']);
                    if ($publicId) {
                        $cloudinary->deleteResource($publicId);
                    }
                }
            }
        }
        if ($story->file_url && str_contains($story->file_url, 'cloudinary')) {
            $publicId = CloudinaryService::extractPublicIdFromUrl($story->file_url);
            if ($publicId) {
                $cloudinary->deleteResource($publicId);
            }
        }
        if ($story->thumbnail && str_contains($story->thumbnail, 'cloudinary')) {
            $publicId = CloudinaryService::extractPublicIdFromUrl($story->thumbnail);
            if ($publicId) {
                $cloudinary->deleteResource($publicId);
            }
        }
    }

    /**
     * Store a new story inside the specified event.
     */
    public function storeStory(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
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
