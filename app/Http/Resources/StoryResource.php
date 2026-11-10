<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $resource = $this->resource;

        if (is_array($resource)) {
            $thumbnail = $resource['thumbnail'] ?? null;
            $fileUrl = $resource['file_url'] ?? null;
            $createdAt = $resource['created_at'] ?? $resource['date'] ?? null;

            $thumbnailResolved = MediaUrl::resolve($thumbnail, $request);
            $fileUrlResolved = MediaUrl::resolve($fileUrl, $request);

            $createdAtFormatted = null;
            if ($createdAt instanceof \DateTimeInterface) {
                $createdAtFormatted = $createdAt->format('M d, Y');
            } elseif (is_string($createdAt)) {
                $createdAtFormatted = $createdAt;
            }

            return [
                'id' => $resource['id'] ?? null,
                'uuid' => $resource['uuid'] ?? null,
                'title' => $resource['title'] ?? null,
                'description' => $resource['description'] ?? null,
                'type' => $resource['type'] ?? null,
                'visibility' => $resource['visibility'] ?? 'normal',
                'is_featured' => $resource['is_featured'] ?? false,
                'thumbnail' => $thumbnailResolved,
                'file_url' => $fileUrlResolved,
                'duration' => $resource['duration'] ?? null,
                'assets' => $resource['assets'] ?? null,
                'created_at' => $createdAtFormatted,
                'user' => $resource['user'] ?? $resource['author'] ?? null,
                'tagged_people' => $resource['tagged_people'] ?? [],
            ];
        }

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'visibility' => $this->visibility->value,
            'is_featured' => $this->visibility->value === 'vip',
            'can_edit' => (bool) ($this->resource->can_edit ?? false),
            'can_delete' => (bool) ($this->resource->can_delete ?? false),
            'thumbnail' => MediaUrl::resolve($this->thumbnail, $request),
            'file_url' => MediaUrl::resolve($this->file_url, $request),
            'duration' => $this->duration,
            'assets' => $this->assets,
            'created_at' => $this->created_at?->format('M d, Y'),
            'user' => $this->user?->name,
            'tagged_people' => $this->resource->tagged_people ?? [],
        ];
    }
}
