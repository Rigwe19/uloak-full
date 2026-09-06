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
        // NOTE: processing_logs schema is (media_id, media_uuid, from_state, to_state, metadata, …) — not (type/status/processed_at).
        // We store story_update idempotency as to_state='story_updated' + metadata.type='story_update'.
        $processedMedia = Media::where('status', 'ready')
            ->where('processing_completed_at', '>=', now()->subMinutes(5))
            ->whereNotIn('id', function ($query) {
                $query->select('media_id')
                    ->from('processing_logs')
                    ->where('to_state', 'story_updated');

                $driver = \DB::getDriverName();

                if ($driver === 'pgsql') {
                    $query->whereRaw("metadata->>'type' = ?", ['story_update']);
                } else {
                    $query->where('metadata->type', 'story_update');
                }
            })
            ->limit($this->limit)
            ->get();

        foreach ($processedMedia as $media) {
            $this->updateStoriesWithMedia($media);

            // Log that we've processed this media — use real processing_logs columns
            \DB::table('processing_logs')->insert([
                'media_id' => $media->id,
                'media_uuid' => $media->uuid,
                'from_state' => null,
                'to_state' => 'story_updated',
                'metadata' => json_encode([
                    'type' => 'story_update',
                    'status' => 'completed',
                    'processed_at' => now()->toIso8601String(),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    protected function updateStoriesWithMedia(Media $media): void
    {
        // Find stories that reference this media in their assets array
        // Use driver-aware JSON containment to support MySQL, Postgres (production), and SQLite (tests)
        $driver = \DB::getDriverName();
        $uuid = $media->uuid;

        try {
            if ($driver === 'pgsql') {
                // Postgres: assets is jsonb — @> checks containment. Use array wrapper so subset matching works
                $candidate = json_encode([['media_uuid' => $uuid]]);
                $stories = Story::whereRaw('assets::jsonb @> ?', [$candidate])->get();
            } elseif ($driver === 'mysql') {
                // MySQL: JSON_CONTAINS with candidate JSON object
                $candidate = json_encode(['media_uuid' => $uuid]);
                $stories = Story::whereRaw("JSON_CONTAINS(assets, CAST(? AS JSON), '$')", [$candidate])->get();
            } else {
                // SQLite / fallback — LIKE is sufficient for queue job (small candidate set)
                $stories = Story::where('assets', 'like', '%"media_uuid":"'.$uuid.'"%')->get();
            }
        } catch (\Throwable $e) {
            // Fallback to PHP filtering if DB JSON operator not available (e.g., assets is TEXT)
            \Log::warning('UpdateStoriesWithPendingMedia: JSON query failed, falling back to PHP filter', [
                'media_id' => $media->id,
                'driver' => $driver,
                'error' => $e->getMessage(),
            ]);
            $stories = Story::whereNotNull('assets')->get()->filter(function ($story) use ($uuid) {
                $assets = $story->assets;
                if (is_string($assets)) {
                    $assets = json_decode($assets, true) ?? [];
                }
                foreach ((array) $assets as $asset) {
                    if (($asset['media_uuid'] ?? null) === $uuid) {
                        return true;
                    }
                }

                return false;
            });
        }

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
