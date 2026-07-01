<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tribute extends Model
{
    protected $fillable = [
        'room_id', 'name', 'relationship', 'message', 'quote', 'images', 'video',
        'audio', 'audio_transcript_id', 'audio_transcript', 'audio_transcript_status',
        'is_approved',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'is_approved' => 'boolean',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
