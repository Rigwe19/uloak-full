<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property string $consent_type
 * @property string $status
 * @property int|null $granted_by
 * @property int|null $guardian_id
 * @property int $version
 * @property string|null $evidence
 * @property string|null $expires_at
 * @property string|null $withdrawn_at
 * @property int|null $created_by
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonConsent extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'consent_type',
        'status',
        'granted_by',
        'guardian_id',
        'version',
        'evidence',
        'expires_at',
        'withdrawn_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'expires_at' => 'immutable_datetime',
            'withdrawn_at' => 'immutable_datetime',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'guardian_id');
    }
}
