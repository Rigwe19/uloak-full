<?php

namespace App\Http\Resources;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Room */
class RoomDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'room' => new RoomResource($this->resource),
            'stories' => StoryResource::collection($this->whenLoaded('stories', fn () => $this->stories)),
            'tributes' => TributeResource::collection($this->whenLoaded('tributes', fn () => $this->tributes)),
            'candles' => CandleResource::collection($this->whenLoaded('candles', fn () => $this->candles)),
            'pagination' => $this->when(isset($this->pagination), fn () => $this->pagination),
        ];
    }
}
