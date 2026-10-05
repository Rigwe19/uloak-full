<?php

namespace Database\Seeders;

use App\Enums\RoomKind;
use App\Models\Person;
use App\Models\PersonIdentity;
use App\Models\PersonPermission;
use App\Models\PersonRelationship;
use App\Models\Room;
use App\Models\User;
use App\Person\Enums\PermissionAbility;
use App\Person\Enums\RelationshipType;
use App\Services\RoomService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

/**
 * Family Archive rollout seeder.
 *
 * Reads real family data from JSON (never fabricated):
 *   storage/app/family-archive.json
 *
 * See database/seeders/family-archive.example.json for the shape.
 * Missing file → prints setup instructions and exits cleanly.
 *
 * Idempotent: re-running skips existing people (matched by created_by +
 * identity legal_name), relationships, and root/branch rooms.
 * Person Rooms are NOT created here — they appear on demand once a person
 * has content (see the "Database existence ≠ UI visibility" rule).
 */
class FamilyArchiveSeeder extends Seeder
{
    protected ?string $sourcePath = null;

    public function sourcePath(?string $path): static
    {
        $this->sourcePath = $path;

        return $this;
    }

    protected function inputPath(): string
    {
        return $this->sourcePath ?? storage_path('app/family-archive.json');
    }

    public function run(): void
    {
        $path = $this->inputPath();

        if (! File::exists($path)) {
            $this->command?->warn("Family archive input not found: {$path}");
            $this->command?->line('Copy database/seeders/family-archive.example.json to storage/app/family-archive.json,');
            $this->command?->line('fill in the confirmed family names, then re-run:');
            $this->command?->line('  php artisan db:seed --class=Database\\Seeders\\FamilyArchiveSeeder');

            return;
        }

        $data = json_decode(File::get($path), true);

        if (! is_array($data)) {
            $this->command?->error("Invalid JSON in {$path}");

            return;
        }

        $owner = User::where('email', $data['owner_email'] ?? null)->first();

        if ($owner === null) {
            $this->command?->error('No user found for owner_email: '.($data['owner_email'] ?? '(missing)'));

            return;
        }

        $rooms = app(RoomService::class);

        // Root couple.
        $grandparents = [];
        foreach ($data['root']['grandparents'] ?? [] as $attrs) {
            $grandparents[] = $this->findOrCreatePerson($owner->id, $attrs);
        }

        if (count($grandparents) === 2) {
            $this->linkOnce($grandparents[0], $grandparents[1], RelationshipType::IsMarriedTo->value);
        }

        if (! empty($data['root']['room_name'])) {
            $this->findOrCreateRoom($rooms, $owner, RoomKind::Root, $data['root']['room_name']);
        }

        foreach ($data['branches'] ?? [] as $branch) {
            $child = $this->findOrCreatePerson($owner->id, $branch['child']);

            foreach ($grandparents as $grandparent) {
                $this->linkOnce($child, $grandparent, RelationshipType::IsChildOf->value);
            }

            if (! empty($branch['partner'])) {
                $partner = $this->findOrCreatePerson($owner->id, $branch['partner']);
                $this->linkOnce($child, $partner, RelationshipType::IsMarriedTo->value);
            }

            foreach ($branch['grandchildren'] ?? [] as $attrs) {
                $grandchild = $this->findOrCreatePerson($owner->id, $attrs);
                $this->linkOnce($grandchild, $child, RelationshipType::IsChildOf->value);
            }

            if (! empty($branch['room_name'])) {
                $this->findOrCreateRoom($rooms, $owner, RoomKind::Branch, $branch['room_name']);
            }
        }

        $this->command?->info('Family archive seeded: '.Person::where('created_by', $owner->id)->count().' people for '.$owner->email);
    }

    /**
     * @param  array{legal_name: string, display_name?: string, gender?: string, living_status?: string, birth_date?: string}  $attrs
     */
    protected function findOrCreatePerson(int $ownerId, array $attrs): Person
    {
        $existing = Person::where('created_by', $ownerId)
            ->whereHas('identity', fn ($q) => $q->where('legal_name', $attrs['legal_name']))
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $person = Person::create([
            'user_id' => null,
            'type' => 'family_member',
            'living_status' => $attrs['living_status'] ?? 'living',
            'created_by' => $ownerId,
        ]);

        PersonIdentity::create([
            'person_id' => $person->id,
            'legal_name' => $attrs['legal_name'],
            'display_name' => $attrs['display_name'] ?? null,
            'gender' => $attrs['gender'] ?? null,
            'birth_date' => $attrs['birth_date'] ?? null,
        ]);

        PersonPermission::create([
            'person_id' => $person->id,
            'grantee_type' => 'user',
            'grantee_id' => $ownerId,
            'ability' => PermissionAbility::Edit->value,
            'allowed' => true,
        ]);

        return $person;
    }

    protected function linkOnce(Person $person, Person $related, string $type): void
    {
        $exists = PersonRelationship::where('person_id', $person->id)
            ->where('related_person_id', $related->id)
            ->where('relationship_type', $type)
            ->exists();

        if (! $exists) {
            PersonRelationship::create([
                'person_id' => $person->id,
                'related_person_id' => $related->id,
                'relationship_type' => $type,
                'kind' => 'biological',
                'status' => 'active',
                'confidence' => 100,
            ]);
        }
    }

    protected function findOrCreateRoom(RoomService $rooms, User $owner, RoomKind $kind, string $name): Room
    {
        $existing = Room::where('created_by', $owner->id)
            ->where('kind', $kind->value)
            ->where('name', $name)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return $rooms->createRoom($owner, [
            'name' => $name,
            'privacy' => 'private',
            'kind' => $kind->value,
        ]);
    }
}
