<?php

namespace App\Http\Resources;

use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Story */
class FeedStoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'file_url' => $this->file_url,
            'thumbnail' => $this->thumbnail,
            'duration' => $this->duration,
            'author' => $this->user?->name ?? $this->guest_name,
            'date' => $this->created_at->format('M d, Y'),
            'tags' => $this->tags ?? [],
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->profile_photo_url,
            ]),
            'room' => $this->whenLoaded('room', fn () => [
                'id' => $this->room->id,
                'slug' => $this->room->slug,
                'name' => $this->room->name,
            ]),
            'comments_count' => $this->comments_count ?? $this->comments()->count(),
        ];
    }
}
