<?php

namespace App\Http\Resources;

use App\Models\HouseMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin HouseMember */
class HouseMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $resource = $this->resource;

        if (is_array($resource)) {
            $createdAt = $resource['created_at'] ?? null;

            return [
                'id' => $resource['id'] ?? null,
                'name' => $resource['name'] ?? null,
                'email' => $resource['email'] ?? null,
                'avatar' => $resource['avatar'] ?? null,
                'bio' => $resource['bio'] ?? null,
                'position' => $resource['position'] ?? null,
                'created_at' => $createdAt instanceof \DateTimeInterface ? $createdAt->toIso8601String() : $createdAt,
            ];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'position' => $this->position,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
