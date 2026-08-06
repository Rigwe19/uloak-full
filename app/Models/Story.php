<?php

namespace App\Models;

use Database\Factories\StoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Story extends Model
{
    /** @use HasFactory<StoryFactory> */
    use HasFactory;

    protected $fillable = [
        'uuid', 'room_id', 'event_id', 'user_id', 'room_member_id', 'guest_name', 'guest_email', 'title', 'thumbnail', 'type',
        'description', 'duration', 'file_url', 'tags', 'assets', 'transcript_id', 'transcript', 'transcript_status',
        'follow_up_to',
    ];

    protected static function booted(): void
    {
        static::creating(function (Story $story) {
            if (empty($story->uuid)) {
                $story->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function getGuestName(): ?string
    {
        return $this->guest_name;
    }

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'assets' => 'array',
            'transcript' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function roomMember(): BelongsTo
    {
        return $this->belongsTo(RoomMember::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function followUpStories(): HasMany
    {
        return $this->hasMany(Story::class, 'follow_up_to');
    }

    public function parentStory(): BelongsTo
    {
        return $this->belongsTo(Story::class, 'follow_up_to');
    }

    public function commentsCount(): int
    {
        return $this->comments()->count();
    }

    public function likesCount(): int
    {
        return $this->likes()->count();
    }

    /**
     * Get all media records associated with this story's assets.
     */
    public function media()
    {
        $uuids = collect($this->assets ?? [])->pluck('media_uuid')->filter()->toArray();

        return $this->hasMany(Media::class, 'uuid', 'media_uuid')
            ->whereIn('uuid', $uuids);
    }

    /**
     * Get only ready media assets.
     */
    public function getReadyAssetsAttribute(): array
    {
        $uuids = collect($this->assets ?? [])->pluck('media_uuid')->filter()->toArray();

        if (empty($uuids)) {
            return [];
        }

        $readyMedia = Media::whereIn('uuid', $uuids)->where('status', 'ready')->get()->keyBy('uuid');

        return collect($this->assets ?? [])->map(function ($asset) use ($readyMedia) {
            if (isset($asset['media_uuid']) && $readyMedia->has($asset['media_uuid'])) {
                $media = $readyMedia->get($asset['media_uuid']);

                return array_merge($asset, [
                    'url' => $media->url(),
                    'thumbnail' => $media->thumbnail,
                    'type' => $media->type,
                    'duration' => $media->duration,
                    'width' => $media->width,
                    'height' => $media->height,
                    'status' => 'ready',
                ]);
            }

            return $asset;
        })->filter()->toArray();
    }

    /**
     * Get pending media assets (still processing).
     */
    public function getPendingAssetsAttribute(): array
    {
        $uuids = collect($this->assets ?? [])->pluck('media_uuid')->filter()->toArray();

        if (empty($uuids)) {
            return [];
        }

        $pendingMedia = Media::whereIn('uuid', $uuids)
            ->whereIn('status', ['uploading', 'processing'])
            ->get()
            ->keyBy('uuid');

        return collect($this->assets ?? [])->map(function ($asset) use ($pendingMedia) {
            if (isset($asset['media_uuid']) && $pendingMedia->has($asset['media_uuid'])) {
                $media = $pendingMedia->get($asset['media_uuid']);

                return array_merge($asset, [
                    'status' => 'pending',
                    'processing' => true,
                ]);
            }

            return $asset;
        })->filter()->toArray();
    }

    /**
     * Refresh assets from media records.
     */
    public function refreshAssets(): array
    {
        $uuids = collect($this->assets ?? [])->pluck('media_uuid')->filter()->toArray();

        if (empty($uuids)) {
            return [];
        }

        $mediaRecords = Media::whereIn('uuid', $uuids)->get()->keyBy('uuid');

        $assets = collect($this->assets ?? [])->map(function ($asset) use ($mediaRecords) {
            if (isset($asset['media_uuid']) && $mediaRecords->has($asset['media_uuid'])) {
                $media = $mediaRecords->get($asset['media_uuid']);

                return array_merge($asset, [
                    'url' => $media->url(),
                    'thumbnail' => $media->thumbnail,
                    'type' => $media->type,
                    'duration' => $media->duration,
                    'width' => $media->width,
                    'height' => $media->height,
                    'updated_at' => now()->toIso8601String(),
                ]);
            }

            return $asset;
        })->filter()->toArray();

        $this->update(['assets' => $assets]);

        return $assets;
    }
}
