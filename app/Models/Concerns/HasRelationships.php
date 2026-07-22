<?php

namespace App\Models\Concerns;

use App\Models\PersonRelationship;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

trait HasRelationships
{
    public function relationships(): HasMany
    {
        return $this->hasMany(PersonRelationship::class, 'person_id');
    }

    public function relatedToMe(): HasMany
    {
        return $this->hasMany(PersonRelationship::class, 'related_person_id');
    }

    public function children()
    {
        return $this->hasMany(Person::class, 'parent_id');
    }

    public function parents()
    {
        return $this->hasMany(Person::class, 'child_id');
    }

    public function partners()
    {
        return $this->relationships()->whereIn('relationship_type', [
            'spouse',
            'partner',
            'ex_spouse',
            'ex_partner',
        ]);
    }

    public function siblings()
    {
        $parentIds = $this->relationships()
            ->where('relationship_type', 'parent')
            ->pluck('related_person_id');

        return PersonRelationship::whereIn('related_person_id', $parentIds)
            ->where('relationship_type', 'parent')
            ->where('person_id', '!=', $this->id)
            ->with('person')
            ->get()
            ->pluck('person');
    }

    public function scopeAncestorsOf(Builder $query, Person $person): Builder
    {
        return $query->whereHas('relationships', function ($q) use ($person) {
            $q->where('related_person_id', $person->id)
                ->where('relationship_type', 'parent');
        });
    }

    public function scopeDescendantsOf(Builder $query, Person $person): Builder
    {
        return $query->where('parent_id', $person->id);
    }
}
