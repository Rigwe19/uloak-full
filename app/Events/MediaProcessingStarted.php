<?php

namespace App\Events;

use App\Models\Media;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class MediaProcessingStarted implements ShouldBroadcast
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
        return 'media.processing.started';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->media->uuid,
            'status' => 'processing',
        ];
    }
}
