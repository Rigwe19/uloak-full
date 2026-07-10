<?php

use App\Models\Media;
use App\Models\Person;
use App\Models\PersonAddress;
use App\Models\PersonAuditLog;
use App\Models\PersonConsent;
use App\Models\PersonDocument;
use App\Models\PersonHeritage;
use App\Models\PersonIdentity;
use App\Models\PersonLanguage;
use App\Models\PersonMedia;
use App\Models\PersonMilestone;
use App\Models\PersonNote;
use App\Models\PersonPermission;
use App\Models\PersonPersonality;
use App\Models\PersonRelationship;
use App\Models\PersonRelationshipSource;
use App\Models\PersonRole;
use App\Models\PersonStatistic;
use App\Models\PersonStoryLink;
use App\Models\PersonTag;
use App\Models\PersonTimeline;
use App\Models\PersonTitle;
use App\Models\PersonVoiceSample;
use App\Models\Story;
use App\Models\User;

beforeEach(function () {
    $this->person = Person::factory()->create();
    $this->identity = PersonIdentity::factory()->create(['person_id' => $this->person->id]);
});

test('person can be created with uuid', function () {
    expect($this->person->uuid)->not->toBeNull()
        ->and($this->person->type)->toBe('family_member')
        ->and($this->person->living_status)->toBe('living');
});

test('person has deceased state', function () {
    $deceased = Person::factory()->deceased()->create();

    expect($deceased->living_status)->toBe('deceased')
        ->and($deceased->isDeceased())->toBeTrue();
});

test('person has memorial type', function () {
    $memorial = Person::factory()->memorial()->create();

    expect($memorial->type)->toBe('memorial')
        ->and($memorial->living_status)->toBe('deceased');
});

test('person belongs to user', function () {
    $user = User::factory()->create();
    $person = Person::factory()->create(['user_id' => $user->id]);

    expect($person->user->id)->toBe($user->id)
        ->and($user->person->id)->toBe($person->id);
});

test('person has identity', function () {
    expect($this->person->identity->id)->toBe($this->identity->id)
        ->and($this->identity->person->id)->toBe($this->person->id);
});

test('identity getDisplayName returns display_name or legal_name', function () {
    $person = Person::factory()->create();
    $identity = PersonIdentity::factory()->create([
        'person_id' => $person->id,
        'legal_name' => 'John Michael Doe',
        'display_name' => 'Johnny',
    ]);

    expect($identity->getDisplayName())->toBe('Johnny');

    $identity->update(['display_name' => null]);
    $identity->refresh();

    expect($identity->getDisplayName())->toBe('John Michael Doe');
});

test('person relationships create edges', function () {
    $parent = Person::factory()->create();
    PersonIdentity::factory()->create(['person_id' => $parent->id, 'legal_name' => 'Parent']);

    $relation = PersonRelationship::factory()->create([
        'person_id' => $this->person->id,
        'related_person_id' => $parent->id,
        'relationship_type' => 'is_child_of',
    ]);

    expect($relation->person->id)->toBe($this->person->id)
        ->and($relation->relatedPerson->id)->toBe($parent->id)
        ->and($this->person->outgoingRelationships->first()->id)->toBe($relation->id)
        ->and($parent->incomingRelationships->first()->id)->toBe($relation->id);
});

test('person roles can be assigned', function () {
    PersonRole::factory()->create([
        'person_id' => $this->person->id,
        'role' => 'family_head',
        'context' => 'Uloak Clan',
    ]);

    expect($this->person->roles->first()->role)->toBe('family_head');
});

test('person titles can be assigned', function () {
    PersonTitle::factory()->create([
        'person_id' => $this->person->id,
        'title' => 'Chief',
        'is_traditional' => true,
        'year' => 1990,
    ]);

    expect($this->person->titles->first()->title)->toBe('Chief');
});

test('person addresses can be stored', function () {
    PersonAddress::factory()->create([
        'person_id' => $this->person->id,
        'type' => 'birth',
        'city' => 'Lagos',
        'country' => 'Nigeria',
    ]);

    expect($this->person->addresses->first()->country)->toBe('Nigeria');
});

test('person heritage can be stored', function () {
    PersonHeritage::factory()->create([
        'person_id' => $this->person->id,
        'ethnicity' => 'Yoruba',
        'tribe' => 'Ife',
    ]);

    expect($this->person->heritage->ethnicity)->toBe('Yoruba');
});

test('person languages can be stored', function () {
    PersonLanguage::factory()->create([
        'person_id' => $this->person->id,
        'language' => 'Yoruba',
        'proficiency' => 'native',
    ]);

    expect($this->person->languages->first()->language)->toBe('Yoruba');
});

test('person media pivot works', function () {
    $media = Media::factory()->create();
    PersonMedia::factory()->create([
        'person_id' => $this->person->id,
        'media_id' => $media->id,
        'role' => 'profile_photo',
    ]);

    expect($this->person->media->first()->media_id)->toBe($media->id)
        ->and($this->person->media->first()->role)->toBe('profile_photo');
});

test('person documents can be stored', function () {
    PersonDocument::factory()->create([
        'person_id' => $this->person->id,
        'document_type' => 'will',
    ]);

    expect($this->person->documents->first()->document_type)->toBe('will');
});

test('person voice samples can be stored', function () {
    $media = Media::factory()->create();
    PersonVoiceSample::factory()->create([
        'person_id' => $this->person->id,
        'media_id' => $media->id,
        'transcript' => 'Hello world',
        'language' => 'en',
    ]);

    expect($this->person->voiceSamples->first()->transcript)->toBe('Hello world');
});

test('person story links create graph', function () {
    $story = Story::factory()->create(['title' => 'Test', 'type' => 'photo']);
    PersonStoryLink::factory()->create([
        'person_id' => $this->person->id,
        'story_id' => $story->id,
        'role' => 'subject',
    ]);

    expect($this->person->storyLinks->first()->story_id)->toBe($story->id)
        ->and($this->person->storyLinks->first()->role)->toBe('subject');
});

test('person personality sections can be stored', function () {
    PersonPersonality::factory()->create([
        'person_id' => $this->person->id,
        'section' => 'childhood',
        'content' => 'Grew up in a small village.',
    ]);

    expect($this->person->personality->first()->section)->toBe('childhood');
});

test('person milestones can be stored', function () {
    PersonMilestone::factory()->create([
        'person_id' => $this->person->id,
        'title' => 'Won Essay Competition',
        'category' => 'achievement',
        'date' => '2000-06-15',
    ]);

    expect($this->person->milestones->first()->category)->toBe('achievement');
});

test('person permissions can be managed', function () {
    PersonPermission::factory()->create([
        'person_id' => $this->person->id,
        'grantee_type' => 'family',
        'ability' => 'edit',
        'allowed' => true,
    ]);

    expect($this->person->permissions->first()->ability)->toBe('edit');
});

test('person consents are versioned', function () {
    PersonConsent::factory()->create([
        'person_id' => $this->person->id,
        'consent_type' => 'profile_visibility',
        'status' => 'granted',
        'version' => 1,
    ]);

    PersonConsent::factory()->create([
        'person_id' => $this->person->id,
        'consent_type' => 'profile_visibility',
        'status' => 'withdrawn',
        'version' => 2,
    ]);

    expect($this->person->consents->count())->toBe(2)
        ->and($this->person->consents->last()->version)->toBe(2);
});

test('person timeline entries can be stored', function () {
    PersonTimeline::factory()->create([
        'person_id' => $this->person->id,
        'event_type' => 'birth',
        'title' => 'Born in Lagos',
        'date' => '1980-01-15',
        'location' => 'Lagos',
    ]);

    expect($this->person->timeline->first()->event_type)->toBe('birth');
});

test('person notes can be stored', function () {
    PersonNote::factory()->create([
        'person_id' => $this->person->id,
        'body' => 'Loved storytelling.',
        'visibility' => 'family',
    ]);

    expect($this->person->notes->first()->body)->toBe('Loved storytelling.');
});

test('person tags can be stored', function () {
    PersonTag::factory()->create([
        'person_id' => $this->person->id,
        'tag' => 'storyteller',
    ]);

    expect($this->person->tags->first()->tag)->toBe('storyteller');
});

test('person statistics can be recorded', function () {
    PersonStatistic::factory()->create([
        'person_id' => $this->person->id,
        'metric' => 'stories',
        'value' => 5,
        'period' => 'total',
    ]);

    expect($this->person->statistics->first()->value)->toBe(5.0);
});

test('person audit logs can be recorded', function () {
    $user = User::factory()->create();
    PersonAuditLog::factory()->create([
        'person_id' => $this->person->id,
        'actor_id' => $user->id,
        'action' => 'profile_updated',
        'ip' => '127.0.0.1',
    ]);

    expect($this->person->auditLogs->first()->action)->toBe('profile_updated');
});

test('person relationship sources can be stored', function () {
    $source = PersonRelationshipSource::factory()->create([
        'type' => 'dna',
        'description' => 'DNA test results',
    ]);

    expect($source->type)->toBe('dna');
});

test('person force deletes identity', function () {
    $id = $this->identity->id;
    $this->person->forceDelete();

    expect(PersonIdentity::find($id))->toBeNull();
});

test('person soft deletes', function () {
    $this->person->delete();

    expect(Person::withTrashed()->find($this->person->id))->not->toBeNull()
        ->and(Person::find($this->person->id))->toBeNull();
});

test('person scope queries', function () {
    Person::factory()->featured()->count(3)->create();
    Person::factory()->count(5)->create();

    expect(Person::featured()->count())->toBe(3);
});

test('person can be created via user', function () {
    $user = User::factory()->create();
    $person = Person::factory()->create(['user_id' => $user->id]);

    expect($user->person->id)->toBe($person->id)
        ->and($person->user->id)->toBe($user->id);
});
