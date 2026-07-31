<?php

namespace App\Http\Controllers;

use App\Media\Cloudinary\CloudinaryService;
use App\Models\Media;
use App\Models\Room;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\AnalyticsService;
use App\Services\StoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoryController extends Controller
{
    public function __construct(
        protected StoryService $storyService,
        protected ActivityLogger $activityLogger,
        protected AnalyticsService $analytics
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

        $story = $this->storyService->createStory($request->user(), $room, $validated);

        $this->analytics->track('story.created', story: $story);

        if ($request->user()) {
            $this->activityLogger->log(
                "Created story: {$story->title}",
                Story::class,
                (string) $story->id,
                ['room_id' => $room->id, 'room_name' => $room->name]
            );
        } else {
            $this->activityLogger->logForGuest(
                "Created story: {$story->title}",
                ['guest_name' => $request->input('guest_name')],
                Story::class,
                (string) $story->id
            );
        }

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

        $media = null;
        foreach ($story->assets ?? [] as $asset) {
            if (isset($asset['media_uuid'])) {
                $media = Media::where('uuid', $asset['media_uuid'])->first();
                if ($media) {
                    break;
                }
            }
        }

        $thumbnail = $story->thumbnail ?? $media?->thumbnail ?? $media?->url() ?? null;
        $fileUrl = $story->file_url ?? $media?->url() ?? null;
        $sprite = $media?->sprite ?? null;

        if (! $story->thumbnail && ! $story->file_url && $media) {
            $story->update([
                'thumbnail' => $thumbnail,
                'file_url' => $fileUrl,
            ]);
        }

        return Inertia::render('dashboard/stories/show', [
            'title' => $story->title.' - Uloak',
            'meta_description' => $story->description ?? 'A memory preserved on Uloak.',
            'story' => [
                'uuid' => $story->uuid,
                'id' => $story->id,
                'title' => $story->title,
                'description' => $story->description,
                'type' => $story->type,
                'thumbnail' => $story->thumbnail,
                'author' => $story->user?->name ?? $story->guest_name,
                'date' => $story->created_at->format('M d, Y'),
                'tags' => $story->tags ?? [],
                'assets' => $story->assets ?? [],
                'fileUrl' => $story->file_url,
                'sprite' => $sprite,
                'transcript' => $story->transcript ?? [],
                'comments' => $story->comments()->with('user')->latest()->get()->map(fn ($comment) => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'author' => $comment->user?->name ?? $comment->guest_name,
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
            'prevStory' => $prevStory ? [
                'uuid' => $prevStory->uuid,
                'id' => $prevStory->id,
                'title' => $prevStory->title,
                'thumbnail' => $prevStory->thumbnail,
            ] : null,
            'nextStory' => $nextStory ? [
                'uuid' => $nextStory->uuid,
                'id' => $nextStory->id,
                'title' => $nextStory->title,
                'thumbnail' => $nextStory->thumbnail,
            ] : null,
        ]);
    }

    public function showData(Story $story): JsonResponse
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

        $media = null;
        foreach ($story->assets ?? [] as $asset) {
            if (isset($asset['media_uuid'])) {
                $media = Media::where('uuid', $asset['media_uuid'])->first();
                if ($media) {
                    break;
                }
            }
        }

        $thumbnail = $story->thumbnail ?? $media?->thumbnail ?? $media?->url() ?? null;
        $fileUrl = $story->file_url ?? $media?->url() ?? null;
        $sprite = $media?->sprite ?? null;

        if (! $story->thumbnail && ! $story->file_url && $media) {
            $story->update([
                'thumbnail' => $thumbnail,
                'file_url' => $fileUrl,
            ]);
        }

        return response()->json([
            'story' => [
                'uuid' => $story->uuid,
                'id' => $story->id,
                'title' => $story->title,
                'description' => $story->description,
                'type' => $story->type,
                'thumbnail' => $thumbnail,
                'author' => $story->user?->name ?? $story->guest_name,
                'date' => $story->created_at->format('M d, Y'),
                'tags' => $story->tags ?? [],
                'assets' => $story->assets ?? [],
                'fileUrl' => $fileUrl,
                'sprite' => $sprite,
                'transcript' => $story->transcript ?? [],
                'comments' => $story->comments()->with('user')->latest()->get()->map(fn ($comment) => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'author' => $comment->user?->name ?? $comment->guest_name,
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
            'prevStory' => $prevStory ? [
                'uuid' => $prevStory->uuid,
                'id' => $prevStory->id,
                'title' => $prevStory->title,
                'thumbnail' => $prevStory->thumbnail,
            ] : null,
            'nextStory' => $nextStory ? [
                'uuid' => $nextStory->uuid,
                'id' => $nextStory->id,
                'title' => $nextStory->title,
                'thumbnail' => $nextStory->thumbnail,
            ] : null,
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

    /**
     * Delete a story.
     */
    public function destroy(Story $story, CloudinaryService $cloudinary): RedirectResponse
    {
        // Delete Cloudinary resources associated with this story
        $this->deleteStoryCloudinaryResources($story, $cloudinary);

        $story->delete();

        $this->analytics->track('story.deleted', story: $story);

        $this->activityLogger->log(
            "Deleted story: {$story->title}",
            Story::class,
            (string) $story->id,
            ['room_id' => $story->room_id]
        );

        return redirect()->back()->with('success', 'Memory deleted.');
    }

    /**
     * Delete all Cloudinary resources associated with a story.
     */
    protected function deleteStoryCloudinaryResources(Story $story, CloudinaryService $cloudinary): void
    {
        // 1. Delete via Media records linked to this story's assets
        if ($story->assets) {
            foreach ($story->assets as $asset) {
                if (isset($asset['media_uuid'])) {
                    $media = Media::where('uuid', $asset['media_uuid'])->first();
                    if ($media && $media->cloudinary_public_id) {
                        $cloudinary->deleteResource($media->cloudinary_public_id);
                        $media->delete();
                    }
                }

                // Also try extracting public ID from asset URL
                if (isset($asset['url']) && str_contains($asset['url'], 'cloudinary')) {
                    $publicId = CloudinaryService::extractPublicIdFromUrl($asset['url']);
                    if ($publicId) {
                        $cloudinary->deleteResource($publicId);
                    }
                }
            }
        }

        // 2. Delete via file_url if it's a Cloudinary URL
        if ($story->file_url && str_contains($story->file_url, 'cloudinary')) {
            $publicId = CloudinaryService::extractPublicIdFromUrl($story->file_url);
            if ($publicId) {
                $cloudinary->deleteResource($publicId);
            }
        }

        // 3. Delete via thumbnail if it's a Cloudinary URL
        if ($story->thumbnail && str_contains($story->thumbnail, 'cloudinary')) {
            $publicId = CloudinaryService::extractPublicIdFromUrl($story->thumbnail);
            if ($publicId) {
                $cloudinary->deleteResource($publicId);
            }
        }
    }
}
