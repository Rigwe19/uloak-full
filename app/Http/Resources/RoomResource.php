<?php

namespace App\Http\Resources;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Room */
class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'room_type' => $this->room_type,
            'tier_type' => $this->tier_type?->value,
            'status' => $this->status?->value,
            'privacy' => $this->privacy,
            'thumbnail' => $this->thumbnail ? (str_starts_with($this->thumbnail, 'http') || str_starts_with($this->thumbnail, '/storage') ? $this->thumbnail : Storage::disk('public')->url(ltrim($this->thumbnail, '/'))) : null,
            'tribute_name' => $this->tribute_name,
            'enable_tributes' => (bool) $this->enable_tributes,
            'enable_candle_lighting' => (bool) $this->enable_candle_lighting,
            'storage_used_bytes' => (int) ($this->storage_used_bytes ?? 0),
            'storage_limit_bytes' => $this->storage_limit_bytes ? (int) $this->storage_limit_bytes : null,
            'remaining_storage_bytes' => $this->remainingStorageBytes(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'contributions_closed_at' => $this->contributions_closed_at?->toIso8601String(),
            'contributions_open' => $this->contributionsOpen(),
            'contribution_block_reason' => $this->contributionBlockReason(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'stories_count' => $this->whenCounted('stories'),
            'tributes_count' => $this->whenCounted('tributes'),
            'photos_count' => $this->whenCounted('photos_count'),
            'videos_count' => $this->whenCounted('videos_count'),
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
        ];
    }
}
