<?php

namespace App\Jobs;

use App\Models\Media;
use App\Models\Story;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateStoriesWithPendingMedia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public function __construct(
        public int $limit = 100,
    ) {}

    public function handle(): void
    {
        // Find media that is now ready but was previously processing
        $processedMedia = Media::where('status', 'ready')
            ->where('processing_completed_at', '>=', now()->subMinutes(5))
            ->whereNotIn('id', function ($query) {
                $query->select('media_id')
                    ->from('processing_logs')
                    ->where('type', 'story_update')
                    ->where('status', 'completed');
            })
            ->limit($this->limit)
            ->get();

        foreach ($processedMedia as $media) {
            $this->updateStoriesWithMedia($media);

            // Log that we've processed this media
            \DB::table('processing_logs')->insert([
                'media_id' => $media->id,
                'type' => 'story_update',
                'status' => 'completed',
                'processed_at' => now(),
            ]);
        }
    }

    protected function updateStoriesWithMedia(Media $media): void
    {
        // Find stories that reference this media in their assets array
        $stories = Story::whereRaw("JSON_CONTAINS(assets, JSON_OBJECT('media_uuid', ?), '$')", [$media->uuid])
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

    public function failed(\Throwable $exception): void
    {
        \Log::error('UpdateStoriesWithPendingMedia failed', [
            'error' => $exception->getMessage(),
        ]);
    }
}
