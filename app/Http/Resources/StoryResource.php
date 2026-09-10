<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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

            $thumbnailResolved = $thumbnail ? (str_starts_with($thumbnail, 'http') || str_starts_with($thumbnail, '/storage') ? $thumbnail : Storage::disk('public')->url(ltrim($thumbnail, '/'))) : null;
            $fileUrlResolved = $fileUrl ? (str_starts_with($fileUrl, 'http') || str_starts_with($fileUrl, '/storage') ? $fileUrl : Storage::disk('public')->url(ltrim($fileUrl, '/'))) : null;

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
                'thumbnail' => $thumbnailResolved,
                'file_url' => $fileUrlResolved,
                'duration' => $resource['duration'] ?? null,
                'assets' => $resource['assets'] ?? null,
                'created_at' => $createdAtFormatted,
                'user' => $resource['user'] ?? $resource['author'] ?? null,
            ];
        }

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'thumbnail' => $this->thumbnail ? (str_starts_with($this->thumbnail, 'http') || str_starts_with($this->thumbnail, '/storage') ? $this->thumbnail : Storage::disk('public')->url(ltrim($this->thumbnail, '/'))) : null,
            'file_url' => $this->file_url ? (str_starts_with($this->file_url, 'http') || str_starts_with($this->file_url, '/storage') ? $this->file_url : Storage::disk('public')->url(ltrim($this->file_url, '/'))) : null,
            'duration' => $this->duration,
            'assets' => $this->assets,
            'created_at' => $this->created_at?->format('M d, Y'),
            'user' => $this->user?->name,
        ];
    }
}
