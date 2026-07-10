<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property int $media_id
 * @property string|null $transcript
 * @property string|null $language
 * @property bool $is_consent_given
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonVoiceSample extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'media_id',
        'transcript',
        'language',
        'is_consent_given',
    ];

    protected function casts(): array
    {
        return [
            'is_consent_given' => 'boolean',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
