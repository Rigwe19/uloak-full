<?php

namespace App\Services;

use App\Enums\RoomKind;
use App\Models\Person;
use App\Models\PersonStoryLink;
use App\Models\Room;
use App\Models\Story;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * Reverse surfacing for Person Rooms.
 *
 * A story has exactly one canonical room (stories.room_id). A Person Room
 * surfaces two sets without copying records:
 *
 * 1. stories stored directly in the Person Room (room_id = person room id);
 * 2. stories linked to the room's person via person_story_links (typically
 *    living in Event Rooms).
 *
 * Every room story-read path routes its base query through storiesQuery()
 * so person rooms behave identically on dashboard, house, family, client,
 * share, and API surfaces. Person profile pages (people/stories|memories)
 * read the same links via Person::storyLinks().
 */
class PersonArchiveService
{
    public function isPersonRoom(Room $room): bool
    {
        $kind = $room->kind instanceof RoomKind ? $room->kind->value : $room->kind;

        return $kind === RoomKind::Person->value && $room->person_id !== null;
    }

    public function personFor(Room $room): ?Person
    {
        if (! $this->isPersonRoom($room)) {
            return null;
        }

        return $room->person ?? Person::find($room->person_id);
    }

    /**
     * @return array<int>
     */
    public function linkedStoryIds(Room $room): array
    {
        if (! $this->isPersonRoom($room)) {
            return [];
        }

        return PersonStoryLink::where('person_id', $room->person_id)
            ->pluck('story_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /**
     * Base story query for a room. Person rooms get a grouped
     * direct-OR-linked query (deduped by primary key, no copies);
     * every other room gets its plain stories relation query.
     *
     * @return Builder<Story>
     */
    public function storiesQuery(Room $room): Builder
    {
        if (! $this->isPersonRoom($room)) {
            return $room->stories()->getQuery();
        }

        $linkedIds = $this->linkedStoryIds($room);

        $query = Story::query()->where(function ($q) use ($room, $linkedIds) {
            $q->where('stories.room_id', $room->id);

            if ($linkedIds !== []) {
                $q->orWhereIn('stories.id', $linkedIds);
            }
        });

        return $query;
    }

    /**
     * @return Collection<int, Story>
     */
    public function getStories(Room $room): Collection
    {
        return $this->storiesQuery($room)->latest()->get();
    }

    public function directCount(Room $room): int
    {
        return $room->stories()->count();
    }

    public function linkedCount(Room $room): int
    {
        return count($this->linkedStoryIds($room));
    }

    public function archiveCount(Room $room): int
    {
        if (! $this->isPersonRoom($room)) {
            return $this->directCount($room);
        }

        return $this->storiesQuery($room)->count();
    }

    /**
     * Attach a `tagged_people` attribute to every story in the collection:
     * [{id, uuid, display_name, person_room_slug|null}]. Two queries total
     * regardless of collection size; safe to call on empty collections.
     *
     * @param  Collection<int, Story>  $stories
     * @return Collection<int, Story>
     */
    public function enrichStoriesWithPeople(Collection $stories): Collection
    {
        if ($stories->isEmpty()) {
            return $stories;
        }

        $stories->loadMissing(['taggedPeople.identity']);

        $personIds = $stories
            ->flatMap(fn (Story $story) => $story->taggedPeople->pluck('id'))
            ->unique()->values();

        $roomSlugs = $personIds->isEmpty()
            ? collect()
            : Room::whereIn('person_id', $personIds)->pluck('slug', 'person_id');

        foreach ($stories as $story) {
            $story->setAttribute('tagged_people', $story->taggedPeople->map(fn (Person $person) => [
                'id' => $person->id,
                'uuid' => $person->uuid,
                'display_name' => $person->identity?->getDisplayName() ?? 'Unnamed',
                'person_room_slug' => $roomSlugs[$person->id] ?? null,
            ])->values()->all());
        }

        return $stories;
    }

    /**
     * Payload meta for room show responses. Null for non-person rooms.
     *
     * @return array{person: array{id: int, uuid: string, display_name: ?string}, direct_count: int, linked_count: int, archive_count: int}|null
     */
    public function meta(Room $room): ?array
    {
        $person = $this->personFor($room);

        if ($person === null) {
            return null;
        }

        return [
            'person' => [
                'id' => $person->id,
                'uuid' => $person->uuid,
                'display_name' => $person->identity?->display_name ?? $person->identity?->legal_name,
            ],
            'direct_count' => $this->directCount($room),
            'linked_count' => $this->linkedCount($room),
            'archive_count' => $this->archiveCount($room),
        ];
    }
}
