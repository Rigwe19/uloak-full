<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\PersonPermission;
use App\Person\Enums\LivingStatus;
use App\Person\Enums\PermissionAbility;
use App\Person\Enums\PersonType;
use App\Person\Enums\Visibility;
use App\Services\PersonService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PersonController extends Controller
{
    public function __construct(
        protected PersonService $personService,
    ) {}

    public function show(Request $request, Person $person): RedirectResponse
    {
        return redirect()->route('people.about', $person);
    }

    public function about(Request $request, Person $person): Response
    {
        $this->authorize('view', $person);

        $person->load([
            'identity', 'heritage', 'languages', 'roles', 'titles',
            'addresses', 'personality', 'milestones', 'tags',
        ]);

        return Inertia::render('people/about', [
            'title' => ($person->identity?->display_name ?? 'About').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'identity' => $person->identity,
            'heritage' => $person->heritage,
            'languages' => $person->languages,
            'roles' => $person->roles,
            'titles' => $person->titles,
            'addresses' => $person->addresses,
            'personality' => $person->personality,
            'milestones' => $person->milestones,
            'tags' => $person->tags,
        ]);
    }

    public function familyTree(Request $request, Person $person): Response
    {
        $this->authorize('view', $person);

        $graph = $this->personService->getRelationshipGraph($person);

        return Inertia::render('people/family-tree', [
            'title' => ($person->identity?->display_name ?? 'Family Tree').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'graph' => $graph,
        ]);
    }

    public function timeline(Request $request, Person $person): Response
    {
        $this->authorize('view', $person);

        $events = $this->personService->getTimeline($person);

        return Inertia::render('people/timeline', [
            'title' => ($person->identity?->display_name ?? 'Timeline').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'events' => $events,
        ]);
    }

    public function stories(Request $request, Person $person): Response
    {
        $this->authorize('view', $person);

        $stories = $person->storyLinks()
            ->with(['story' => fn ($q) => $q->with('room:id,name,slug')])
            ->latest()
            ->paginate(12);

        return Inertia::render('people/stories', [
            'title' => ($person->identity?->display_name ?? 'Stories').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'stories' => $stories,
        ]);
    }

    public function media(Request $request, Person $person): Response
    {
        $this->authorize('view', $person);

        $media = $this->personService->getMediaArchive($person);

        return Inertia::render('people/media', [
            'title' => ($person->identity?->display_name ?? 'Media').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'media' => $media,
        ]);
    }

    public function heritage(Request $request, Person $person): Response
    {
        $this->authorize('view', $person);

        $person->load('heritage', 'languages');

        return Inertia::render('people/heritage', [
            'title' => ($person->identity?->display_name ?? 'Heritage').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'heritage' => $person->heritage,
            'languages' => $person->languages,
        ]);
    }

    public function memories(Request $request, Person $person): Response
    {
        $this->authorize('view', $person);

        $memories = $person->storyLinks()
            ->with(['story' => fn ($q) => $q->with('room:id,name,slug')])
            ->latest()
            ->paginate(12);

        return Inertia::render('people/memories', [
            'title' => ($person->identity?->display_name ?? 'Memories').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'memories' => $memories,
        ]);
    }

    public function permissions(Request $request, Person $person): Response
    {
        $this->authorize('managePermissions', $person);

        $permissions = $this->personService->getPermissions($person);
        $consents = $this->personService->getConsents($person);

        return Inertia::render('people/permissions', [
            'title' => ($person->identity?->display_name ?? 'Permissions').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'permissions' => $permissions,
            'consents' => $consents,
        ]);
    }

    public function activity(Request $request, Person $person): Response
    {
        $this->authorize('viewActivity', $person);

        $logs = $this->personService->getActivity($person);

        return Inertia::render('people/activity', [
            'title' => ($person->identity?->display_name ?? 'Activity').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'logs' => $logs,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('people/create', [
            'title' => 'Create Person - Uloak',
            'personTypes' => collect(PersonType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => str($t->name)->headline(),
            ]),
            'livingStatuses' => collect(LivingStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => str($s->name)->headline(),
            ]),
            'visibilities' => collect(Visibility::cases())->map(fn ($v) => [
                'value' => $v->value,
                'label' => str($v->name)->headline(),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'legal_name' => ['required', 'string', 'max:255'],
            'display_name' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:'.implode(',', array_column(PersonType::cases(), 'value'))],
            'living_status' => ['required', 'string', 'in:'.implode(',', array_column(LivingStatus::cases(), 'value'))],
            'birth_date' => ['nullable', 'date'],
            'death_date' => ['nullable', 'date', 'after_or_equal:birth_date'],
            'gender' => ['nullable', 'string', 'max:50'],
        ]);

        $person = Person::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'living_status' => $validated['living_status'],
            'created_by' => $request->user()->id,
        ]);

        $person->identity()->create([
            'legal_name' => $validated['legal_name'],
            'display_name' => $validated['display_name'],
            'gender' => $validated['gender'],
            'birth_date' => $validated['birth_date'],
            'death_date' => $validated['death_date'],
            'age_visibility' => Visibility::Public->value,
        ]);

        PersonPermission::create([
            'person_id' => $person->id,
            'grantee_type' => 'user',
            'grantee_id' => $request->user()->id,
            'ability' => PermissionAbility::Edit->value,
            'allowed' => true,
        ]);

        return redirect()->route('people.show', $person)
            ->with('flash', ['success' => 'Person created successfully.']);
    }

    public function edit(Request $request, Person $person): Response
    {
        $this->authorize('edit', $person);

        $person->load([
            'identity', 'heritage', 'languages', 'roles', 'titles',
            'addresses', 'personality', 'milestones', 'tags', 'notes',
        ]);

        return Inertia::render('people/edit', [
            'title' => 'Edit '.($person->identity?->getDisplayName() ?? 'Profile').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'identity' => $person->identity,
            'heritage' => $person->heritage,
            'languages' => $person->languages,
            'roles' => $person->roles,
            'titles' => $person->titles,
            'addresses' => $person->addresses,
            'personality' => $person->personality,
            'milestones' => $person->milestones,
            'tags' => $person->tags,
            'personTypes' => collect(PersonType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => str($t->name)->headline(),
            ]),
            'livingStatuses' => collect(LivingStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => str($s->name)->headline(),
            ]),
            'visibilities' => collect(Visibility::cases())->map(fn ($v) => [
                'value' => $v->value,
                'label' => str($v->name)->headline(),
            ]),
        ]);
    }

    public function update(Request $request, Person $person): RedirectResponse
    {
        $this->authorize('edit', $person);

        $validated = $request->validate([
            'legal_name' => ['required', 'string', 'max:255'],
            'display_name' => ['nullable', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:255'],
            'traditional_name' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:'.implode(',', array_column(PersonType::cases(), 'value'))],
            'living_status' => ['required', 'string', 'in:'.implode(',', array_column(LivingStatus::cases(), 'value'))],
            'family_branch' => ['nullable', 'string', 'max:255'],
            'clan' => ['nullable', 'string', 'max:255'],
            'kindred' => ['nullable', 'string', 'max:255'],
            'ancestral_home' => ['nullable', 'string', 'max:255'],
            'diaspora_generation' => ['nullable', 'integer', 'min:0'],
            'birth_date' => ['nullable', 'date'],
            'death_date' => ['nullable', 'date', 'after_or_equal:birth_date'],
            'birth_place' => ['nullable', 'string', 'max:255'],
            'death_place' => ['nullable', 'string', 'max:255'],
            'burial_location' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:50'],
            'biography' => ['nullable', 'string'],
            'short_introduction' => ['nullable', 'string', 'max:500'],
            'age_visibility' => ['nullable', 'string', 'in:'.implode(',', array_column(Visibility::cases(), 'value'))],

            'heritage.nationality' => ['nullable', 'string', 'max:255'],
            'heritage.ethnicity' => ['nullable', 'string', 'max:255'],
            'heritage.tribe' => ['nullable', 'string', 'max:255'],
            'heritage.clan' => ['nullable', 'string', 'max:255'],
            'heritage.village' => ['nullable', 'string', 'max:255'],
            'heritage.town' => ['nullable', 'string', 'max:255'],
            'heritage.state' => ['nullable', 'string', 'max:255'],
            'heritage.country' => ['nullable', 'string', 'max:255'],
            'heritage.religion' => ['nullable', 'string', 'max:255'],
            'heritage.migration_story' => ['nullable', 'string'],

            'languages' => ['nullable', 'array'],
            'languages.*.language' => ['required_with:languages', 'string', 'max:255'],
            'languages.*.dialect' => ['nullable', 'string', 'max:255'],
            'languages.*.proficiency' => ['nullable', 'string', 'max:50'],

            'addresses' => ['nullable', 'array'],
            'addresses.*.type' => ['required_with:addresses', 'string', 'max:50'],
            'addresses.*.line1' => ['nullable', 'string', 'max:255'],
            'addresses.*.city' => ['nullable', 'string', 'max:255'],
            'addresses.*.town' => ['nullable', 'string', 'max:255'],
            'addresses.*.village' => ['nullable', 'string', 'max:255'],
            'addresses.*.state' => ['nullable', 'string', 'max:255'],
            'addresses.*.country' => ['nullable', 'string', 'max:255'],

            'milestones' => ['nullable', 'array'],
            'milestones.*.title' => ['required_with:milestones', 'string', 'max:255'],
            'milestones.*.description' => ['nullable', 'string'],
            'milestones.*.date' => ['nullable', 'date'],
            'milestones.*.category' => ['nullable', 'string', 'max:255'],

            'roles' => ['nullable', 'array'],
            'roles.*.role' => ['required_with:roles', 'string', 'max:255'],
            'roles.*.context' => ['nullable', 'string', 'max:255'],

            'titles' => ['nullable', 'array'],
            'titles.*.title' => ['required_with:titles', 'string', 'max:255'],
            'titles.*.is_traditional' => ['nullable', 'boolean'],
            'titles.*.granted_by' => ['nullable', 'string', 'max:255'],
            'titles.*.year' => ['nullable', 'integer'],

            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:255'],
        ]);

        $person->update([
            'type' => $validated['type'],
            'living_status' => $validated['living_status'],
            'family_branch' => $validated['family_branch'] ?? null,
            'clan' => $validated['clan'] ?? null,
            'kindred' => $validated['kindred'] ?? null,
            'ancestral_home' => $validated['ancestral_home'] ?? null,
            'diaspora_generation' => $validated['diaspora_generation'] ?? null,
        ]);

        $this->personService->updateIdentity($person, [
            'legal_name' => $validated['legal_name'],
            'display_name' => $validated['display_name'],
            'nickname' => $validated['nickname'],
            'traditional_name' => $validated['traditional_name'] ?? null,
            'gender' => $validated['gender'],
            'birth_date' => $validated['birth_date'],
            'death_date' => $validated['death_date'],
            'birth_place' => $validated['birth_place'],
            'death_place' => $validated['death_place'],
            'burial_location' => $validated['burial_location'] ?? null,
            'biography' => $validated['biography'],
            'short_introduction' => $validated['short_introduction'] ?? null,
            'age_visibility' => $validated['age_visibility'] ?? Visibility::Public->value,
        ]);

        if ($heritage = ($validated['heritage'] ?? null)) {
            $person->heritage()->updateOrCreate(
                ['person_id' => $person->id],
                $heritage
            );
        }

        if ($request->has('languages')) {
            $person->languages()->delete();
            foreach ($validated['languages'] ?? [] as $lang) {
                $person->languages()->create($lang);
            }
        }

        if ($request->has('addresses')) {
            $person->addresses()->delete();
            foreach ($validated['addresses'] ?? [] as $addr) {
                $person->addresses()->create($addr);
            }
        }

        if ($request->has('milestones')) {
            $person->milestones()->delete();
            foreach ($validated['milestones'] ?? [] as $ms) {
                $person->milestones()->create($ms);
            }
        }

        if ($request->has('roles')) {
            $person->roles()->delete();
            foreach ($validated['roles'] ?? [] as $role) {
                $person->roles()->create($role);
            }
        }

        if ($request->has('titles')) {
            $person->titles()->delete();
            foreach ($validated['titles'] ?? [] as $title) {
                $person->titles()->create($title);
            }
        }

        if ($request->has('tags')) {
            $person->tags()->delete();
            foreach ($validated['tags'] ?? [] as $tag) {
                $person->tags()->create(['tag' => $tag]);
            }
        }

        return redirect()->route('people.show', $person)
            ->with('flash', ['success' => 'Person updated successfully.']);
    }

    protected function serializePerson(Person $person, Request $request): array
    {
        $identity = $person->identity;
        $isOwner = $request->user()?->id === $person->user_id;

        return [
            'id' => $person->id,
            'uuid' => $person->uuid,
            'type' => $person->type,
            'living_status' => $person->living_status,
            'family_branch' => $person->family_branch,
            'clan' => $person->clan,
            'kindred' => $person->kindred,
            'ancestral_home' => $person->ancestral_home,
            'diaspora_generation' => $person->diaspora_generation,
            'is_featured' => $person->is_featured,
            'is_owner' => $isOwner,
            'name' => $identity?->getDisplayName() ?? 'Unknown',
            'legal_name' => $identity?->legal_name,
            'nickname' => $identity?->nickname,
            'gender' => $identity?->gender,
            'birth_date' => $identity?->birth_date,
            'death_date' => $identity?->death_date,
            'birth_place' => $identity?->birth_place,
            'death_place' => $identity?->death_place,
            'burial_location' => $identity?->burial_location,
            'biography' => $identity?->biography?->limit(300) ?? '',
            'short_introduction' => $identity?->short_introduction,
            'age_visibility' => $identity?->age_visibility ?? 'public',
            'avatar_url' => null,
        ];
    }
}
