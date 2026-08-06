<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Room;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\AnalyticsService;
use App\Services\StoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

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
    public function store(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
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
            'description' => ['nullable', 'string'],
        ]);

        $story->update($validated);

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

    /**
     * Get story data for editing.
     */
    public function showData(Story $story)
    {
        $this->authorizeStory($story);

        return response()->json([
            'story' => $story,
            'assets' => $story->getReadyAssetsAttribute(),
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
