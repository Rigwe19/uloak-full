<?php

namespace App\Services;

use App\Models\Person;
use App\Models\PersonConsent;
use App\Models\PersonIdentity;
use App\Models\PersonPermission;
use App\Models\PersonRelationship;
use App\Models\PersonTimeline;
use App\Models\User;
use App\Person\Enums\PermissionAbility;
use App\Person\Enums\PersonType;
use App\Person\Enums\Visibility;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class PersonService
{
    public function findOrCreateForUser(User $user): Person
    {
        return $user->person ?? $this->createFromUser($user);
    }

    public function createFromUser(User $user, array $data = []): Person
    {
        $person = Person::create(array_filter(array_merge([
            'uuid' => (string) Str::uuid(),
            'user_id' => $user->id,
            'type' => PersonType::ActiveUser->value,
            'living_status' => 'living',
            'created_by' => $user->id,
        ], $data)));

        PersonIdentity::create([
            'person_id' => $person->id,
            'legal_name' => $user->name,
            'age_visibility' => Visibility::Public->value,
        ]);

        PersonPermission::create([
            'person_id' => $person->id,
            'grantee_type' => 'user',
            'grantee_id' => $user->id,
            'ability' => PermissionAbility::Edit->value,
            'allowed' => true,
        ]);

        return $person;
    }

    public function updateIdentity(Person $person, array $data): PersonIdentity
    {
        $identity = $person->identity ?? PersonIdentity::create(['person_id' => $person->id]);

        $identity->update($data);

        return $identity;
    }

    public function addRelationship(Person $person, Person $related, string $type, array $data = []): PersonRelationship
    {
        return PersonRelationship::create(array_merge([
            'person_id' => $person->id,
            'related_person_id' => $related->id,
            'relationship_type' => $type,
            'kind' => 'biological',
            'status' => 'active',
            'confidence' => 100,
        ], $data));
    }

    public function addTimelineEvent(Person $person, string $eventType, string $title, array $data = []): PersonTimeline
    {
        return PersonTimeline::create(array_merge([
            'person_id' => $person->id,
            'event_type' => $eventType,
            'title' => $title,
            'sort_order' => $person->timeline()->count() + 1,
        ], $data));
    }

    public function addConsent(Person $person, string $consentType, string $status, ?int $grantedBy = null): PersonConsent
    {
        $latestVersion = $person->consents()
            ->where('consent_type', $consentType)
            ->max('version') ?? 0;

        return PersonConsent::create([
            'person_id' => $person->id,
            'consent_type' => $consentType,
            'status' => $status,
            'granted_by' => $grantedBy,
            'version' => $latestVersion + 1,
        ]);
    }

    public function setPermission(Person $person, string $granteeType, ?int $granteeId, string $ability, bool $allowed): PersonPermission
    {
        return PersonPermission::updateOrCreate(
            [
                'person_id' => $person->id,
                'grantee_type' => $granteeType,
                'grantee_id' => $granteeId,
                'ability' => $ability,
            ],
            ['allowed' => $allowed]
        );
    }

    public function getMediaArchive(Person $person): Collection
    {
        return $person->media()->with('media')->orderBy('sort_order')->get();
    }

    public function getTimeline(Person $person): Collection
    {
        return $person->timeline()->orderBy('date')->orderBy('sort_order')->get();
    }

    public function getRelationshipGraph(Person $person): array
    {
        $outgoing = $person->outgoingRelationships()
            ->with(['relatedPerson', 'relatedPerson.identity'])
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'person_id' => $r->related_person_id,
                'name' => $r->relatedPerson?->identity?->display_name ?? 'Unknown',
                'relationship_type' => $r->relationship_type,
                'kind' => $r->kind,
                'status' => $r->status,
                'direction' => 'outgoing',
                'called_them' => $r->called_them,
                'closeness' => $r->closeness,
            ]);

        $incoming = $person->incomingRelationships()
            ->with(['person', 'person.identity'])
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'person_id' => $r->person_id,
                'name' => $r->person?->identity?->display_name ?? 'Unknown',
                'relationship_type' => $r->relationship_type,
                'kind' => $r->kind,
                'status' => $r->status,
                'direction' => 'incoming',
                'called_me' => $r->called_me,
                'closeness' => $r->closeness,
            ]);

        return [
            'outgoing' => $outgoing,
            'incoming' => $incoming,
            'graph' => app(RelationshipGraphService::class)->buildTree($person),
        ];
    }

    public function getPermissions(Person $person): Collection
    {
        return $person->permissions()->orderBy('ability')->get();
    }

    public function getConsents(Person $person): Collection
    {
        return $person->consents()->orderBy('consent_type')->orderByDesc('version')->get();
    }

    public function getStatistics(Person $person): array
    {
        $stats = $person->statistics()->where('period', 'total')->get()->keyBy('metric');

        return [
            'stories' => $stats->get('stories')?->value ?? $person->storyLinks()->count(),
            'photos' => $stats->get('photos')?->value ?? $person->media()->whereHas('media', fn ($q) => $q->where('type', 'image'))->count(),
            'videos' => $stats->get('videos')?->value ?? $person->media()->whereHas('media', fn ($q) => $q->where('type', 'video'))->count(),
            'relationships' => $person->outgoingRelationships()->count(),
            'timeline_events' => $person->timeline()->count(),
            'contributions' => $person->storyLinks()->count(),
        ];
    }

    public function getActivity(Person $person, int $limit = 20): Collection
    {
        return $person->auditLogs()
            ->with('actor')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'actor_name' => $log->actor?->name ?? 'System',
                'payload' => $log->payload,
                'created_at' => $log->created_at,
            ]);
    }
}
