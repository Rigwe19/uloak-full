<?php

namespace App\Services;

use App\Models\Person;
use App\Models\PersonRelationship;
use App\Person\Enums\RelationshipType;
use Illuminate\Support\Collection;

class RelationshipGraphService
{
    public function buildTree(Person $person, int $maxDepth = 4): array
    {
        $visited = collect();
        $tree = [
            'person' => $this->personNode($person),
            'ancestors' => $this->buildAncestors($person, $visited, $maxDepth),
            'descendants' => $this->buildDescendants($person, $visited, $maxDepth),
            'siblings' => $this->findSiblings($person),
            'spouses' => $this->findSpouses($person),
        ];

        return $tree;
    }

    protected function buildAncestors(Person $person, Collection $visited, int $depth): array
    {
        if ($depth <= 0 || $visited->has($person->id)) {
            return [];
        }

        $visited->put($person->id, true);

        $parents = PersonRelationship::where('person_id', $person->id)
            ->where('relationship_type', RelationshipType::IsChildOf->value)
            ->with('relatedPerson.identity')
            ->get();

        return $parents->map(fn ($rel) => [
            'person' => $this->personNode($rel->relatedPerson),
            'relationship_type' => 'parent',
            'kind' => $rel->kind,
            'ancestors' => $this->buildAncestors($rel->relatedPerson, $visited, $depth - 1),
        ])->values()->toArray();
    }

    protected function buildDescendants(Person $person, Collection $visited, int $depth): array
    {
        if ($depth <= 0 || $visited->has($person->id)) {
            return [];
        }

        $visited->put($person->id, true);

        $children = PersonRelationship::where('relationship_type', RelationshipType::IsChildOf->value)
            ->where('related_person_id', $person->id)
            ->with('person.identity')
            ->get();

        return $children->map(fn ($rel) => [
            'person' => $this->personNode($rel->person),
            'relationship_type' => 'child',
            'kind' => $rel->kind,
            'descendants' => $this->buildDescendants($rel->person, $visited, $depth - 1),
        ])->values()->toArray();
    }

    protected function findSiblings(Person $person): array
    {
        $parentIds = PersonRelationship::where('person_id', $person->id)
            ->where('relationship_type', RelationshipType::IsChildOf->value)
            ->pluck('related_person_id');

        if ($parentIds->isEmpty()) {
            return [];
        }

        $siblingRelations = PersonRelationship::whereIn('related_person_id', $parentIds)
            ->where('relationship_type', RelationshipType::IsChildOf->value)
            ->where('person_id', '!=', $person->id)
            ->with('person.identity')
            ->get();

        return $siblingRelations->map(fn ($rel) => [
            'person' => $this->personNode($rel->person),
            'kind' => $rel->kind,
        ])->values()->toArray();
    }

    protected function findSpouses(Person $person): array
    {
        $spouseRelations = PersonRelationship::where(function ($q) use ($person) {
            $q->where(function ($q) use ($person) {
                $q->where('person_id', $person->id)
                    ->where('relationship_type', RelationshipType::IsMarriedTo->value);
            })->orWhere(function ($q) use ($person) {
                $q->where('related_person_id', $person->id)
                    ->where('relationship_type', RelationshipType::IsMarriedTo->value);
            });
        })->with(['person.identity', 'relatedPerson.identity'])->get();

        return $spouseRelations->map(fn ($rel) => [
            'person' => $this->personNode(
                $rel->person_id === $person->id ? $rel->relatedPerson : $rel->person
            ),
            'status' => $rel->status,
        ])->values()->toArray();
    }

    public function deriveLabel(RelationshipType $type): string
    {
        return $type->label();
    }

    protected function personNode(?Person $person): ?array
    {
        if ($person === null) {
            return null;
        }

        return [
            'id' => $person->id,
            'uuid' => $person->uuid,
            'name' => $person->identity?->getDisplayName() ?? 'Unknown',
            'living_status' => $person->living_status,
            'type' => $person->type,
        ];
    }
}
