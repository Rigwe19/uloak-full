<?php

namespace App\Events;

use App\Models\Media;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class MediaProcessingCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Media $media,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('media');
    }

    public function broadcastAs(): string
    {
        return 'media.processing.completed';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->media->uuid,
            'status' => 'ready',
            'url' => $this->media->url(),
            'thumbnail' => $this->media->thumbnail,
            'preview' => $this->media->preview,
            'duration' => $this->media->duration,
            'width' => $this->media->width,
            'height' => $this->media->height,
            'sprite' => $this->media->sprite,
        ];
    }
}
