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
