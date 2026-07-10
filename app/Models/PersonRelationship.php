<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property-read int $id
 * @property int $person_id
 * @property int $related_person_id
 * @property string $relationship_type
 * @property string $kind
 * @property string $status
 * @property int $confidence
 * @property int|null $source_id
 * @property string|null $evidence
 * @property int|null $created_by
 * @property int|null $verified_by
 * @property string|null $verified_at
 * @property string|null $called_them
 * @property string|null $called_me
 * @property int|null $closeness
 * @property string|null $favourite_memory
 * @property string|null $relationship_notes
 * @property string|null $things_taught
 * @property string|null $stories_together
 * @property string|null $private_notes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 */
class PersonRelationship extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'person_id',
        'related_person_id',
        'relationship_type',
        'kind',
        'status',
        'confidence',
        'source_id',
        'evidence',
        'created_by',
        'verified_by',
        'verified_at',
        'called_them',
        'called_me',
        'closeness',
        'favourite_memory',
        'relationship_notes',
        'things_taught',
        'stories_together',
        'private_notes',
    ];

    protected function casts(): array
    {
        return [
            'confidence' => 'integer',
            'closeness' => 'integer',
            'verified_at' => 'immutable_datetime',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
            'deleted_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'person_id');
    }

    public function relatedPerson(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'related_person_id');
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(PersonRelationshipSource::class, 'source_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
