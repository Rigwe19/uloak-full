<?php

namespace App\Models;

use Database\Factories\StoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Story extends Model
{
    /** @use HasFactory<StoryFactory> */
    use HasFactory;

    protected $fillable = [
        'room_id', 'event_id', 'user_id', 'title', 'thumbnail', 'type',
        'description', 'duration', 'file_url', 'tags', 'assets', 'transcript_id', 'transcript', 'transcript_status',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'assets' => 'array',
            'transcript' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
