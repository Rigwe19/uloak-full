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
 * @property bool $is_traditional
 * @property string|null $granted_by
 * @property int|null $year
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonTitle extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'title',
        'is_traditional',
        'granted_by',
        'year',
    ];

    protected function casts(): array
    {
        return [
            'is_traditional' => 'boolean',
            'year' => 'integer',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
