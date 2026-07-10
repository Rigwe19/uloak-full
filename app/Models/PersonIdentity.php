<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property string $legal_name
 * @property string|null $display_name
 * @property string|null $nickname
 * @property string|null $traditional_name
 * @property array|null $former_names
 * @property string|null $title
 * @property int|null $pronunciation_audio_media_id
 * @property string|null $gender
 * @property string|null $birth_date
 * @property string|null $death_date
 * @property string|null $birth_place
 * @property string|null $death_place
 * @property string|null $burial_location
 * @property string|null $biography
 * @property string|null $short_introduction
 * @property string $age_visibility
 * @property array|null $field_visibility
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonIdentity extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'legal_name',
        'display_name',
        'nickname',
        'traditional_name',
        'former_names',
        'title',
        'pronunciation_audio_media_id',
        'gender',
        'birth_date',
        'death_date',
        'birth_place',
        'death_place',
        'burial_location',
        'biography',
        'short_introduction',
        'age_visibility',
        'field_visibility',
    ];

    protected function casts(): array
    {
        return [
            'former_names' => 'array',
            'field_visibility' => 'array',
            'birth_date' => 'date:Y-m-d',
            'death_date' => 'date:Y-m-d',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function getDisplayName(): string
    {
        return $this->display_name ?? $this->legal_name;
    }
}
