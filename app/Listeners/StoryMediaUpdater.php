<?php

namespace App\Listeners;

use App\Events\MediaProcessingCompleted;
use App\Models\Media;
use App\Models\Story;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class StoryMediaUpdater implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct()
    {
        //
    }

    public function handle(MediaProcessingCompleted $event): void
    {
        $media = $event->media;

        // Only process if media is ready
        if ($media->status !== 'ready') {
            return;
        }

        // Find stories that reference this media in their assets array
        $stories = Story::where('uuid', $media->uuid)
            ->get();

        foreach ($stories as $story) {
            $this->updateStoryAssets($story, $media);
        }
    }

    protected function updateStoryAssets(Story $story, Media $media): void
    {
        $assets = $story->assets ?? [];

        if (empty($assets)) {
            return;
        }

        $updated = false;

        foreach ($assets as &$asset) {
            if (isset($asset['media_uuid']) && $asset['media_uuid'] === $media->uuid) {
                // Update asset with final media data
                $asset['url'] = $media->url();
                $asset['thumbnail'] = $media->thumbnail ?: null;
                $asset['type'] = $media->type;
                $asset['duration'] = $media->duration;
                $asset['width'] = $media->width;
                $asset['height'] = $media->height;
                $asset['updated_at'] = now()->toIso8601String();
                $updated = true;
            }
        }

        if ($updated) {
            $story->update(['assets' => $assets]);
        }

        // Also update story's main thumbnail if it references this media
        if ($story->thumbnail && str_contains($story->thumbnail, $media->uuid)) {
            $story->update(['thumbnail' => $media->path]);
        }

        // Update file_url if it references this media
        if ($story->file_url && str_contains($story->file_url, $media->uuid)) {
            $story->update(['file_url' => $media->path]);
        }
    }

    public function failed(MediaProcessingCompleted $event, \Throwable $exception): void
    {
        \Log::error('StoryMediaUpdater failed', [
            'media_id' => $event->media->id,
            'media_uuid' => $event->media->uuid,
            'error' => $exception->getMessage(),
        ]);
    }
}
