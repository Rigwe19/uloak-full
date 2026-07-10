<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property string $event_type
 * @property string $title
 * @property string|null $description
 * @property string|null $date
 * @property string|null $location
 * @property array|null $media
 * @property array|null $people
 * @property array|null $stories
 * @property array|null $documents
 * @property int $sort_order
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'event_type',
        'title',
        'description',
        'date',
        'location',
        'media',
        'people',
        'stories',
        'documents',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'media' => 'array',
            'people' => 'array',
            'stories' => 'array',
            'documents' => 'array',
            'sort_order' => 'integer',
            'date' => 'date:Y-m-d',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
