<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\PersonPermission;
use App\Person\Enums\LivingStatus;
use App\Person\Enums\PermissionAbility;
use App\Person\Enums\PersonType;
use App\Person\Enums\Visibility;
use App\Services\PersonService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
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

    public function settingsAbout(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/about', [
                'title' => 'About - Uloak',
                'person' => null,
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => $request->session()->get('status'),
            ]);
        }

        $person->load([
            'identity', 'heritage', 'languages', 'roles', 'titles',
            'addresses', 'personality', 'milestones', 'tags',
        ]);

        return Inertia::render('settings/about', [
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
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function settingsFamilyTree(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/family-tree', [
                'title' => 'Family Tree - Uloak',
                'person' => null,
            ]);
        }

        $graph = $this->personService->getRelationshipGraph($person);

        return Inertia::render('settings/family-tree', [
            'title' => ($person->identity?->display_name ?? 'Family Tree').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'graph' => $graph,
        ]);
    }

    public function settingsTimeline(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/timeline', [
                'title' => 'Timeline - Uloak',
                'person' => null,
            ]);
        }

        $events = $this->personService->getTimeline($person);

        return Inertia::render('settings/timeline', [
            'title' => ($person->identity?->display_name ?? 'Timeline').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'events' => $events,
        ]);
    }

    public function settingsStories(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/stories', [
                'title' => 'Stories - Uloak',
                'person' => null,
            ]);
        }

        $stories = $person->storyLinks()
            ->with(['story' => fn ($q) => $q->with('room:id,name,slug')])
            ->latest()
            ->paginate(12);

        return Inertia::render('settings/stories', [
            'title' => ($person->identity?->display_name ?? 'Stories').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'stories' => $stories,
        ]);
    }

    public function settingsMedia(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/media', [
                'title' => 'Media - Uloak',
                'person' => null,
            ]);
        }

        $media = $this->personService->getMediaArchive($person);

        return Inertia::render('settings/media', [
            'title' => ($person->identity?->display_name ?? 'Media').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'media' => $media,
        ]);
    }

    public function settingsHeritage(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/heritage', [
                'title' => 'Heritage - Uloak',
                'person' => null,
            ]);
        }

        $person->load('heritage', 'languages');

        return Inertia::render('settings/heritage', [
            'title' => ($person->identity?->display_name ?? 'Heritage').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'heritage' => $person->heritage,
            'languages' => $person->languages,
        ]);
    }

    public function settingsMemories(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/memories', [
                'title' => 'Memories - Uloak',
                'person' => null,
            ]);
        }

        $memories = $person->storyLinks()
            ->with(['story' => fn ($q) => $q->with('room:id,name,slug')])
            ->latest()
            ->paginate(12);

        return Inertia::render('settings/memories', [
            'title' => ($person->identity?->display_name ?? 'Memories').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'memories' => $memories,
        ]);
    }

    public function settingsPermissions(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/permissions', [
                'title' => 'Permissions - Uloak',
                'person' => null,
            ]);
        }

        $permissions = $this->personService->getPermissions($person);
        $consents = $this->personService->getConsents($person);

        return Inertia::render('settings/permissions', [
            'title' => ($person->identity?->display_name ?? 'Permissions').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'permissions' => $permissions,
            'consents' => $consents,
        ]);
    }

    public function settingsActivity(Request $request): Response
    {
        $person = $request->user()->person;

        if (! $person) {
            return Inertia::render('settings/activity', [
                'title' => 'Activity - Uloak',
                'person' => null,
            ]);
        }

        $logs = $this->personService->getActivity($person);

        return Inertia::render('settings/activity', [
            'title' => ($person->identity?->display_name ?? 'Activity').' - Uloak',
            'person' => $this->serializePerson($person, $request),
            'logs' => $logs,
        ]);
    }

    public function settingsUpdate(Request $request): RedirectResponse
    {
        $person = $request->user()->person;

        if (! $person) {
            return redirect()->route('settings.about')
                ->with('flash', ['error' => 'No person profile found.']);
        }

        $validated = $request->validate([
            'legal_name' => ['sometimes', 'required', 'string', 'max:255'],
            'display_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'nickname' => ['sometimes', 'nullable', 'string', 'max:255'],
            'traditional_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'required', 'string', 'in:'.implode(',', array_column(PersonType::cases(), 'value'))],
            'living_status' => ['sometimes', 'required', 'string', 'in:'.implode(',', array_column(LivingStatus::cases(), 'value'))],
            'family_branch' => ['sometimes', 'nullable', 'string', 'max:255'],
            'clan' => ['sometimes', 'nullable', 'string', 'max:255'],
            'kindred' => ['sometimes', 'nullable', 'string', 'max:255'],
            'ancestral_home' => ['sometimes', 'nullable', 'string', 'max:255'],
            'diaspora_generation' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'death_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:birth_date'],
            'birth_place' => ['sometimes', 'nullable', 'string', 'max:255'],
            'death_place' => ['sometimes', 'nullable', 'string', 'max:255'],
            'burial_location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'gender' => ['sometimes', 'nullable', 'string', 'max:50'],
            'biography' => ['sometimes', 'nullable', 'string'],
            'short_introduction' => ['sometimes', 'nullable', 'string', 'max:500'],
            'age_visibility' => ['sometimes', 'nullable', 'string', 'in:'.implode(',', array_column(Visibility::cases(), 'value'))],

            'heritage.nationality' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.ethnicity' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.tribe' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.clan' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.village' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.town' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.state' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.country' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.religion' => ['sometimes', 'nullable', 'string', 'max:255'],
            'heritage.migration_story' => ['sometimes', 'nullable', 'string'],

            'languages' => ['sometimes', 'nullable', 'array'],
            'languages.*.language' => ['required_with:languages', 'string', 'max:255'],
            'languages.*.dialect' => ['sometimes', 'nullable', 'string', 'max:255'],
            'languages.*.proficiency' => ['sometimes', 'nullable', 'string', 'max:50'],

            'addresses' => ['sometimes', 'nullable', 'array'],
            'addresses.*.type' => ['required_with:addresses', 'string', 'max:50'],
            'addresses.*.line1' => ['sometimes', 'nullable', 'string', 'max:255'],
            'addresses.*.city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'addresses.*.town' => ['sometimes', 'nullable', 'string', 'max:255'],
            'addresses.*.village' => ['sometimes', 'nullable', 'string', 'max:255'],
            'addresses.*.state' => ['sometimes', 'nullable', 'string', 'max:255'],
            'addresses.*.country' => ['sometimes', 'nullable', 'string', 'max:255'],

            'milestones' => ['sometimes', 'nullable', 'array'],
            'milestones.*.title' => ['required_with:milestones', 'string', 'max:255'],
            'milestones.*.description' => ['sometimes', 'nullable', 'string'],
            'milestones.*.date' => ['sometimes', 'nullable', 'date'],
            'milestones.*.category' => ['sometimes', 'nullable', 'string', 'max:255'],

            'roles' => ['sometimes', 'nullable', 'array'],
            'roles.*.role' => ['required_with:roles', 'string', 'max:255'],
            'roles.*.context' => ['sometimes', 'nullable', 'string', 'max:255'],

            'titles' => ['sometimes', 'nullable', 'array'],
            'titles.*.title' => ['required_with:titles', 'string', 'max:255'],
            'titles.*.is_traditional' => ['sometimes', 'nullable', 'boolean'],
            'titles.*.granted_by' => ['sometimes', 'nullable', 'string', 'max:255'],
            'titles.*.year' => ['sometimes', 'nullable', 'integer'],

            'tags' => ['sometimes', 'nullable', 'array'],
            'tags.*' => ['string', 'max:255'],
        ]);

        if ($request->has('type') || $request->has('living_status') || $request->hasAny(['family_branch', 'clan', 'kindred', 'ancestral_home', 'diaspora_generation'])) {
            $person->update([
                'type' => $validated['type'] ?? $person->type,
                'living_status' => $validated['living_status'] ?? $person->living_status,
                'family_branch' => $validated['family_branch'] ?? $person->family_branch,
                'clan' => $validated['clan'] ?? $person->clan,
                'kindred' => $validated['kindred'] ?? $person->kindred,
                'ancestral_home' => $validated['ancestral_home'] ?? $person->ancestral_home,
                'diaspora_generation' => $validated['diaspora_generation'] ?? $person->diaspora_generation,
            ]);
        }

        if ($request->hasAny(['legal_name', 'display_name', 'nickname', 'traditional_name', 'gender', 'birth_date', 'death_date', 'birth_place', 'death_place', 'burial_location', 'biography', 'short_introduction', 'age_visibility'])) {
            $this->personService->updateIdentity($person, [
                'legal_name' => $validated['legal_name'] ?? $person->identity?->legal_name,
                'display_name' => $validated['display_name'] ?? $person->identity?->display_name,
                'nickname' => $validated['nickname'] ?? $person->identity?->nickname,
                'traditional_name' => $validated['traditional_name'] ?? null,
                'gender' => $validated['gender'] ?? $person->identity?->gender,
                'birth_date' => $validated['birth_date'] ?? $person->identity?->birth_date,
                'death_date' => $validated['death_date'] ?? $person->identity?->death_date,
                'birth_place' => $validated['birth_place'] ?? $person->identity?->birth_place,
                'death_place' => $validated['death_place'] ?? $person->identity?->death_place,
                'burial_location' => $validated['burial_location'] ?? $person->identity?->burial_location,
                'biography' => $validated['biography'] ?? $person->identity?->biography,
                'short_introduction' => $validated['short_introduction'] ?? null,
                'age_visibility' => $validated['age_visibility'] ?? $person->identity?->age_visibility ?? Visibility::Public->value,
            ]);
        }

        if ($request->has('heritage')) {
            $heritage = $validated['heritage'];
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

        return redirect()->back()
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
