<?php

namespace App\Services;

use App\Models\Person;
use App\Models\PersonRelationship;
use App\Models\Room;
use App\Person\Enums\RelationshipType;
use Illuminate\Support\Collection;

class RelationshipGraphService
{
    /** @var array<int, string>|null person_id => room slug, memoized per request. */
    protected static ?array $personRoomSlugs = null;

    /**
     * Clear the memoized slug map (testing).
     */
    public static function flushPersonRoomSlugs(): void
    {
        self::$personRoomSlugs = null;
    }

    /**
     * Slug of the person's Person Room, if one exists. Single query per
     * request regardless of tree size; safe on empty archives.
     */
    public function personRoomSlug(int $personId): ?string
    {
        if (self::$personRoomSlugs === null) {
            self::$personRoomSlugs = Room::whereNotNull('person_id')
                ->pluck('slug', 'person_id')
                ->map(fn ($slug) => (string) $slug)
                ->all();
        }

        return self::$personRoomSlugs[$personId] ?? null;
    }

    public function buildTree(Person $person, int $maxDepth = 4): array
    {
        // Separate visited sets: sharing one marks the root visited during
        // the ancestor pass, which always emptied the descendant pass.
        // Depth still bounds adversarial cycles in either direction.
        $tree = [
            'person' => $this->personNode($person),
            'ancestors' => $this->buildAncestors($person, collect(), $maxDepth),
            'descendants' => $this->buildDescendants($person, collect(), $maxDepth),
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
            'person_room_slug' => $this->personRoomSlug($person->id),
        ];
    }
}
