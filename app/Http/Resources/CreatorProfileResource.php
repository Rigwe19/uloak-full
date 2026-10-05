<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreatorProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ] : null),
            'creator_type' => $this->creator_type->value,
            'is_vip' => $this->isVip(),
            'ref_code' => $this->ref_code,
            'split_pct' => $this->splitPct(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
