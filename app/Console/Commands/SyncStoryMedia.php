<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Models\Story;
use Illuminate\Console\Command;

class SyncStoryMedia extends Command
{
    protected $signature = 'app:sync-story-media
                            {--limit=100 : Maximum number of stories to process}
                            {--verbose : Show detailed output}';

    protected $description = 'Sync existing stories with their media assets when processing completes';

    public function handle(): int
    {
        $limit = $this->option('limit');
        $verbose = $this->option('verbose');

        $this->info('Starting story-media sync...');

        // Find stories with pending media (assets that reference processing media)
        $stories = Story::where(function ($query) {
            $query->whereRaw("JSON_CONTAINS_PATH(assets, 'one', '$[*].media_uuid') IS NOT NULL")
                ->orWhere('media_uuid', '!=', null)
                ->orWhere('file_url', '!=', null);
        })
            ->whereHas('media', function ($query) {
                $query->whereIn('status', ['processing', 'uploading']);
            })
            ->limit($limit)
            ->get();

        $processed = 0;
        $skipped = 0;

        foreach ($stories as $story) {
            $updated = false;

            // Check and update assets
            $assets = $story->assets ?? [];
            if (! empty($assets)) {
                $uuids = collect($assets)->pluck('media_uuid')->filter()->toArray();

                if (! empty($uuids)) {
                    $readyMedia = Media::whereIn('uuid', $uuids)
                        ->where('status', 'ready')
                        ->get()
                        ->keyBy('uuid');

                    foreach ($assets as &$asset) {
                        if (isset($asset['media_uuid']) && $readyMedia->has($asset['media_uuid'])) {
                            $media = $readyMedia->get($asset['media_uuid']);
                            $asset['url'] = $media->url();
                            $asset['thumbnail'] = $media->thumbnail ?: null;
                            $asset['updated_at'] = now()->toIso8601String();
                            $updated = true;
                        }
                    }

                    if ($updated) {
                        $story->update(['assets' => $assets]);
                    }
                }
            }

            // Check story's main thumbnail
            if ($story->thumbnail && $this->shouldUpdateThumbnail($story)) {
                $story->update(['thumbnail' => $story->media->path ?? null]);
                $updated = true;
            }

            // Check story's file_url
            if ($story->file_url && $this->shouldUpdateFileUrl($story)) {
                $story->update(['file_url' => $story->media->path ?? null]);
                $updated = true;
            }

            if ($updated) {
                $processed++;
                if ($verbose) {
                    $this->info("Updated story: {$story->title} (ID: {$story->id})");
                }
            } else {
                $skipped++;
            }
        }

        $this->info("Sync completed: {$processed} stories updated, {$skipped} stories skipped.");

        return self::SUCCESS;
    }

    protected function shouldUpdateThumbnail(Story $story): bool
    {
        $media = $story->media;

        return $media && $media->isReady();
    }

    protected function shouldUpdateFileUrl(Story $story): bool
    {
        $media = $story->media;

        return $media && $media->isReady();
    }
}
