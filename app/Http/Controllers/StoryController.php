<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\AnalyticsService;
use App\Services\StoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StoryController extends Controller
{
    public function __construct(
        protected StoryService $storyService,
        protected ActivityLogger $activityLogger,
        protected AnalyticsService $analytics
    ) {}

    /**
     * Show a single story in the full-screen viewer.
     */
    public function show(Request $request, Story $story)
    {
        $this->authorizeViewing($story, $request->user());

        $room = $story->room;
        $payload = $this->storyPayload($story);
        [$prev, $next] = $this->neighborPreviews($story);

        return Inertia::render('dashboard/stories/show', [
            'story' => $payload,
            'room' => $room
                ? ['id' => $room->id, 'slug' => $room->slug, 'name' => $room->name]
                : ['id' => 0, 'slug' => 'dashboard', 'name' => $story->event?->name ?? 'Stories'],
            'prevStory' => $prev,
            'nextStory' => $next,
        ]);
    }

    /**
     * Store a new story.
     */
    public function store(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'type' => ['required', 'string', 'in:video,audio,photo,document,collection'],
            'visibility' => ['nullable', 'string', 'in:normal,vip'],
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

        if (($validated['visibility'] ?? 'normal') === 'vip' && ! $request->user()->isVipCreator()) {
            return redirect()->back()->withErrors(['visibility' => 'Only approved VIP creators can publish VIP stories.']);
        }

        $story = $this->storyService->createStory(auth()->user(), $room, $validated);

        $this->analytics->track('story.created', story: $story);

        return redirect()->back()->with('success', 'Memory preserved successfully.');
    }

    /**
     * Update a story.
     */
    public function update(Request $request, Story $story): RedirectResponse
    {
        $this->authorizeStory($story);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'person_ids' => ['nullable', 'array'],
            'person_ids.*' => ['integer', 'exists:people,id'],
        ]);

        $story->update($validated);

        if (array_key_exists('person_ids', $validated)) {
            $parent = $story->room ?? $story->event;
            $scopeOwner = ($parent ? $this->storyService->scopeOwnerFor($parent) : null) ?? $request->user();
            $this->storyService->syncTaggedPeople($story, $scopeOwner, $validated['person_ids']);
        }

        $this->analytics->track('story.updated', story: $story);

        return redirect()->back()->with('success', 'Memory updated.');
    }

    /**
     * Delete a story.
     */
    public function destroy(Story $story): RedirectResponse
    {
        // Delete story media from local storage
        if ($story->assets) {
            foreach ($story->assets as $asset) {
                if (isset($asset['media_uuid'])) {
                    $media = Media::where('uuid', $asset['media_uuid'])->first();
                    if ($media) {
                        $this->storyService->deleteMedia($media);
                    }
                }
            }
        }
        $media = Media::where('uuid', $story->uuid)->first();
        logger()->info("Deleting story media for story UUID: {$story->uuid}");
        if ($media) {
            logger()->info("Deleting associated media UUID: {$media->uuid}");
            $this->storyService->deleteMedia($media);
        }

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
     * Restore a soft-deleted story.
     */
    public function restore(Story $story): RedirectResponse
    {
        $story->restore();

        $this->analytics->track('story.restored', story: $story);

        return redirect()->back()->with('success', 'Memory restored.');
    }

    /**
     * Force delete a story permanently.
     */
    public function forceDelete(Story $story): RedirectResponse
    {
        // Delete story media from local storage
        if ($story->assets) {
            foreach ($story->assets as $asset) {
                if (isset($asset['media_uuid'])) {
                    $media = Media::where('uuid', $asset['media_uuid'])->first();
                    if ($media) {
                        $this->storyService->deleteMedia($media);
                    }
                }
            }
        }

        $story->forceDelete();

        return redirect()->back()->with('success', 'Memory permanently deleted.');
    }

    /**
     * Add asset to a collection story.
     */
    public function addAsset(Request $request, Story $story): RedirectResponse
    {
        $this->authorizeStory($story);

        $validated = $request->validate([
            'media_uuid' => ['required', 'uuid', 'exists:media,uuid'],
        ]);

        $media = Media::where('uuid', $validated['media_uuid'])->first();

        if (! $media) {
            return back()->with('error', 'Media not found.');
        }

        $assets = $story->assets ?? [];
        $assets[] = [
            'media_uuid' => $media->uuid,
            'url' => $media->url(),
            'type' => $media->type,
            'created_at' => now()->toIso8601String(),
        ];

        $story->update(['assets' => $assets, 'type' => 'collection']);

        return redirect()->back()->with('success', 'Asset added to collection.');
    }

    /**
     * Remove asset from a collection story.
     */
    public function removeAsset(Story $story, string $mediaUuid): RedirectResponse
    {
        $this->authorizeStory($story);

        $assets = collect($story->assets ?? [])
            ->where('media_uuid', '!=', $mediaUuid)
            ->values()
            ->toArray();

        $story->update(['assets' => $assets]);

        return redirect()->back()->with('success', 'Asset removed from collection.');
    }

    /**
     * Order assets in a collection story.
     */
    public function orderAssets(Request $request, Story $story): RedirectResponse
    {
        $this->authorizeStory($story);

        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['uuid', 'exists:media,uuid'],
        ]);

        $assets = collect($story->assets ?? [])
            ->sortBy(fn ($asset) => array_search($asset['media_uuid'], $validated['order']))
            ->values()
            ->toArray();

        $story->update(['assets' => $assets]);

        return redirect()->back()->with('success', 'Assets reordered.');
    }

    protected function authorizeStory(Story $story): void
    {
        $this->authorize('update', $story);
    }

    protected function authorizeViewing(Story $story, ?User $user): void
    {
        abort_if($user === null, 401);

        if ((bool) $user->is_admin) {
            return;
        }

        if ($story->user_id !== null && $story->user_id === $user->id) {
            return;
        }

        $room = $story->room;
        if ($room !== null) {
            $this->authorize('view', $room);

            return;
        }

        $event = $story->event;
        if ($event !== null) {
            abort_unless(($event->created_by ?? null) === $user->id, 403);

            return;
        }

        abort(404);
    }

    /**
     * Shape a story for the dashboard story viewer.
     */
    protected function storyPayload(Story $story): array
    {
        $story->loadMissing(['user', 'comments']);

        $thumbnail = $story->thumbnail
            ? (str_starts_with($story->thumbnail, 'http') || str_starts_with($story->thumbnail, '/storage')
                ? $story->thumbnail
                : Storage::disk('public')->url(ltrim($story->thumbnail, '/')))
            : null;

        $fileUrl = $story->file_url
            ? (str_starts_with($story->file_url, 'http') || str_starts_with($story->file_url, '/storage')
                ? $story->file_url
                : Storage::disk('public')->url(ltrim($story->file_url, '/')))
            : null;

        $assets = collect($story->assets ?? [])->map(function (array $asset) {
            $url = $asset['url'] ?? null;
            if ($url && ! str_starts_with($url, 'http') && ! str_starts_with($url, '/storage')) {
                $url = Storage::disk('public')->url(ltrim($url, '/'));
            }

            return [...$asset, 'url' => $url];
        })->values()->all();

        return [
            'uuid' => $story->uuid,
            'id' => $story->id,
            'title' => $story->title,
            'description' => $story->description ?? '',
            'type' => $story->type,
            'thumbnail' => $thumbnail,
            'author' => $story->user?->name ?? $story->guest_name ?? 'Anonymous',
            'date' => $story->created_at?->format('M d, Y'),
            'tags' => $story->tags ?? [],
            'assets' => $assets,
            'fileUrl' => $fileUrl,
            'sprite' => $story->transcript ?? null,
            'transcript' => $story->transcript ?? null,
            'comments' => $story->comments->sortByDesc('created_at')->values()->map(fn ($comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'author' => $comment->authorName(),
                'date' => $comment->created_at?->diffForHumans(),
            ])->all(),
        ];
    }

    protected function previewPayload(Story $story): array
    {
        $thumbnail = $story->thumbnail
            ? (str_starts_with($story->thumbnail, 'http') || str_starts_with($story->thumbnail, '/storage')
                ? $story->thumbnail
                : Storage::disk('public')->url(ltrim($story->thumbnail, '/')))
            : null;

        return [
            'uuid' => $story->uuid,
            'id' => $story->id,
            'title' => $story->title,
            'thumbnail' => $thumbnail,
        ];
    }

    /**
     * @return array{0: ?array, 1: ?array} [prev, next] previews in latest-first order.
     */
    protected function neighborPreviews(Story $story): array
    {
        if ($story->room_id !== null) {
            $siblings = Story::where('room_id', $story->room_id)
                ->whereNull('stories.follow_up_to')
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->get(['id', 'uuid', 'title', 'thumbnail']);
        } else {
            $siblings = Story::where('event_id', $story->event_id)
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->get(['id', 'uuid', 'title', 'thumbnail']);
        }

        $index = $siblings->search(fn ($candidate) => $candidate->id === $story->id);
        if ($index === false) {
            return [null, null];
        }

        $prev = $index > 0 ? $this->previewPayload($siblings[$index - 1]) : null;
        $next = $index < $siblings->count() - 1 ? $this->previewPayload($siblings[$index + 1]) : null;

        return [$prev, $next];
    }

    /**
     * Get story data for editing.
     */
    public function showData(Story $story)
    {
        $this->authorizeStory($story);

        [$prev, $next] = $this->neighborPreviews($story);

        return response()->json([
            'story' => $this->storyPayload($story),
            'assets' => $story->getReadyAssetsAttribute(),
            'prevStory' => $prev,
            'nextStory' => $next,
        ]);
    }

    /**
     * Check processing status for a story's media assets.
     */
    public function checkProcessingStatus(Story $story)
    {
        $this->authorizeStory($story);

        $assets = $story->refreshAssets();

        return response()->json([
            'story' => $story,
            'assets' => $assets,
            'pending_count' => count($story->getPendingAssetsAttribute()),
            'ready_count' => count($story->getReadyAssetsAttribute()),
        ]);
    }
}
