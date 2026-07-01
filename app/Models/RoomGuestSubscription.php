<?php

namespace App\Models;

use Database\Factories\RoomGuestSubscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomGuestSubscription extends Model
{
    /** @use HasFactory<RoomGuestSubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'room_id',
        'name',
        'email',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
