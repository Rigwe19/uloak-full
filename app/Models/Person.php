<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\PersonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * @property-read int $id
 * @property-read string $uuid
 * @property int|null $user_id
 * @property string $type
 * @property string $living_status
 * @property int|null $primary_photo_media_id
 * @property int|null $birth_order
 * @property string|null $family_branch
 * @property string|null $clan
 * @property string|null $kindred
 * @property string|null $ancestral_home
 * @property int|null $diaspora_generation
 * @property bool $is_featured
 * @property int|null $created_by
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 */
class Person extends Model
{
    /** @use HasFactory<PersonFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'type',
        'living_status',
        'primary_photo_media_id',
        'birth_order',
        'family_branch',
        'clan',
        'kindred',
        'ancestral_home',
        'diaspora_generation',
        'is_featured',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'birth_order' => 'integer',
            'diaspora_generation' => 'integer',
            'created_at' => 'immutable_datetime',
            'updated_at' => 'immutable_datetime',
            'deleted_at' => 'immutable_datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    protected static function booted(): void
    {
        static::creating(function (Person $person) {
            if (empty($person->uuid)) {
                $person->uuid = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function identity(): HasOne
    {
        return $this->hasOne(PersonIdentity::class, 'person_id');
    }

    public function outgoingRelationships(): HasMany
    {
        return $this->hasMany(PersonRelationship::class, 'person_id');
    }

    public function incomingRelationships(): HasMany
    {
        return $this->hasMany(PersonRelationship::class, 'related_person_id');
    }

    public function relationshipSources(): HasMany
    {
        return $this->hasMany(PersonRelationshipSource::class, 'created_by');
    }

    public function roles(): HasMany
    {
        return $this->hasMany(PersonRole::class, 'person_id');
    }

    public function titles(): HasMany
    {
        return $this->hasMany(PersonTitle::class, 'person_id');
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(PersonAddress::class, 'person_id');
    }

    public function heritage(): HasOne
    {
        return $this->hasOne(PersonHeritage::class, 'person_id');
    }

    public function languages(): HasMany
    {
        return $this->hasMany(PersonLanguage::class, 'person_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(PersonMedia::class, 'person_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PersonDocument::class, 'person_id');
    }

    public function voiceSamples(): HasMany
    {
        return $this->hasMany(PersonVoiceSample::class, 'person_id');
    }

    public function storyLinks(): HasMany
    {
        return $this->hasMany(PersonStoryLink::class, 'person_id');
    }

    public function stories(): HasManyThrough
    {
        return $this->hasManyThrough(Story::class, PersonStoryLink::class, 'person_id', 'id', 'id', 'story_id');
    }

    public function personality(): HasMany
    {
        return $this->hasMany(PersonPersonality::class, 'person_id');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(PersonMilestone::class, 'person_id');
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(PersonPermission::class, 'person_id');
    }

    public function consents(): HasMany
    {
        return $this->hasMany(PersonConsent::class, 'person_id');
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(PersonTimeline::class, 'person_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(PersonNote::class, 'person_id');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(PersonTag::class, 'person_id');
    }

    public function statistics(): HasMany
    {
        return $this->hasMany(PersonStatistic::class, 'person_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(PersonAuditLog::class, 'person_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isDeceased(): bool
    {
        return $this->living_status === 'deceased';
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfClan($query, ?string $clan)
    {
        return $query->when($clan, fn ($q, $c) => $q->where('clan', $c));
    }
}
