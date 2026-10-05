<?php

namespace App\Services;

use App\Models\Person;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Family-archive person scope.
 *
 * There is no family_id / family-account model in the codebase, so person
 * access reuses the exact relationships PersonPolicy::edit() relies on:
 *
 * - people.user_id === owner id (owned profile), or
 * - people.created_by === owner id (created by this owner/keeper), or
 * - an explicit person_permissions row (ability=edit, grantee_type=user,
 *   grantee_id=owner id, allowed=true).
 *
 * Request validation may only check shape (integer + exists); the
 * authorization decision below is enforced at the service layer so API
 * callers cannot bypass it by submitting another family's person id.
 */
class PersonScope
{
    public function linkableBy(User $owner): Builder
    {
        return Person::query()->where(function ($q) use ($owner) {
            $q->where('user_id', $owner->id)
                ->orWhere('created_by', $owner->id)
                ->orWhereHas('permissions', function ($pq) use ($owner) {
                    $pq->where('ability', 'edit')
                        ->where('grantee_type', 'user')
                        ->where('grantee_id', $owner->id)
                        ->where('allowed', true);
                });
        });
    }

    /**
     * @throws ValidationException
     */
    public function assertLinkable(User $owner, int $personId): Person
    {
        $person = $this->linkableBy($owner)->whereKey($personId)->first();

        if ($person === null) {
            throw ValidationException::withMessages([
                'person_id' => 'The selected person is not part of your family archive.',
            ]);
        }

        return $person;
    }

    /**
     * Assert a batch of person ids is linkable, returning the matched people.
     * Fails closed: any id outside the owner's scope rejects the whole batch
     * so a story is never created with partial tagging.
     *
     * @param  array<int>  $personIds
     * @return Collection<int, Person>
     *
     * @throws ValidationException
     */
    public function assertLinkableMany(User $owner, array $personIds): Collection
    {
        $ids = collect($personIds)->map(fn ($id) => (int) $id)->unique()->values();

        if ($ids->isEmpty()) {
            return Person::query()->whereRaw('1 = 0')->get();
        }

        $matched = $this->linkableBy($owner)->whereKey($ids)->get()->keyBy('id');
        $missing = $ids->reject(fn ($id) => $matched->has($id))->values();

        if ($missing->isNotEmpty()) {
            throw ValidationException::withMessages([
                'person_ids' => 'These people are not part of your family archive: '.$missing->implode(', '),
            ]);
        }

        return $matched->values();
    }

    /**
     * Lightweight people list for the "Who's in this story?" picker.
     * Only id/uuid/display_name — safe to expose on share pages.
     *
     * @return array<int, array{id: int, uuid: string, display_name: string}>
     */
    public function taggableFor(User $owner): array
    {
        return $this->linkableBy($owner)
            ->with('identity')
            ->get()
            ->map(fn (Person $person) => [
                'id' => $person->id,
                'uuid' => $person->uuid,
                'display_name' => $person->identity?->getDisplayName() ?? 'Unnamed',
            ])
            ->sortBy('display_name')
            ->values()
            ->all();
    }

    /**
     * Taggable people scoped to a room's family archive (room creator's scope).
     * Empty when the room has no resolvable creator.
     *
     * @return array<int, array{id: int, uuid: string, display_name: string}>
     */
    public function taggableForRoom(Room $room): array
    {
        $creatorId = $room->created_by ?? null;

        if ($creatorId === null) {
            return [];
        }

        $creator = User::find($creatorId);

        return $creator === null ? [] : $this->taggableFor($creator);
    }
}
