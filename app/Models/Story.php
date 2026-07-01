<?php

namespace App\Models;

use Database\Factories\StoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Story extends Model
{
    /** @use HasFactory<StoryFactory> */
    use HasFactory;

    protected $fillable = [
        'room_id', 'event_id', 'user_id', 'room_member_id', 'guest_name', 'guest_email', 'title', 'thumbnail', 'type',
        'description', 'duration', 'file_url', 'tags', 'assets', 'transcript_id', 'transcript', 'transcript_status',
        'follow_up_to',
    ];

    public function getGuestName(): ?string
    {
        return $this->guest_name;
    }

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

    public function roomMember(): BelongsTo
    {
        return $this->belongsTo(RoomMember::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function followUpStories(): HasMany
    {
        return $this->hasMany(Story::class, 'follow_up_to');
    }

    public function parentStory(): BelongsTo
    {
        return $this->belongsTo(Story::class, 'follow_up_to');
    }

    public function commentsCount(): int
    {
        return $this->comments()->count();
    }
}
