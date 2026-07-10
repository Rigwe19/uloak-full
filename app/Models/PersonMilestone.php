<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property string $title
 * @property string|null $description
 * @property string|null $date
 * @property string $category
 * @property array|null $media
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'title',
        'description',
        'date',
        'category',
        'media',
    ];

    protected function casts(): array
    {
        return [
            'media' => 'array',
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
