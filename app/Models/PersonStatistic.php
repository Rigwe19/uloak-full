<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property string $metric
 * @property float $value
 * @property string|null $period
 * @property string|null $recorded_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'metric',
        'value',
        'period',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'float',
            'recorded_at' => 'immutable_datetime',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
