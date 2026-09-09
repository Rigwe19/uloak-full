<?php

namespace App\Http\Resources;

use App\Models\Tribute;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Tribute */
class TributeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_id' => $this->room_id,
            'name' => $this->name,
            'message' => $this->message,
            'images' => $this->images ?? [],
            'video' => $this->video,
            'audio' => $this->audio,
            'is_approved' => (bool) $this->is_approved,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
