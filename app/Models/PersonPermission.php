<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $person_id
 * @property string $grantee_type
 * @property int|null $grantee_id
 * @property string $ability
 * @property bool $allowed
 * @property string|null $inherited_from
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PersonPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'grantee_type',
        'grantee_id',
        'ability',
        'allowed',
        'inherited_from',
    ];

    protected function casts(): array
    {
        return [
            'allowed' => 'boolean',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
        ];
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
