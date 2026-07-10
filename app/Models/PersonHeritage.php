<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property string|null $nationality
 * @property string|null $ethnicity
 * @property string|null $tribe
 * @property string|null $clan
 * @property string|null $village
 * @property string|null $town
 * @property string|null $state
 * @property string|null $country
 * @property string|null $religion
 * @property string|null $migration_story
 * @property array|null $family_recipes
 * @property array|null $cultural_practices
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonHeritage extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'nationality',
        'ethnicity',
        'tribe',
        'clan',
        'village',
        'town',
        'state',
        'country',
        'religion',
        'migration_story',
        'family_recipes',
        'cultural_practices',
    ];

    protected function casts(): array
    {
        return [
            'family_recipes' => 'array',
            'cultural_practices' => 'array',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
