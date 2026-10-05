<?php

namespace App\Console\Commands;

use App\Models\Person;
use App\Models\PersonStoryLink;
use App\Models\Room;
use App\Models\Story;
use Illuminate\Console\Command;

class ArchiveStatus extends Command
{
    protected $signature = 'archive:status {--fix-kinds : Backfill kind=event on rooms with a null/empty kind (the only automatic fix)}';

    protected $description = 'Audit the Family Archive rollout: room kinds, story tagging, and person-room coverage. Read-only unless --fix-kinds is passed.';

    public function handle(): int
    {
        $kinds = Room::query()->selectRaw('COALESCE(NULLIF(kind, ?), ?) as kind, COUNT(*) as c', ['', 'null'])->groupBy('kind')->pluck('c', 'kind');

        $this->info('Rooms by kind:');
        foreach (['root', 'branch', 'person', 'event', 'null'] as $kind) {
            $this->line("  {$kind}: ".($kinds[$kind] ?? 0));
        }

        $taggedStories = PersonStoryLink::distinct('story_id')->count('story_id');
        $totalStories = Story::count();
        $this->info("Stories tagged: {$taggedStories} / {$totalStories}");

        $peopleWithoutRooms = Person::whereDoesntHave('personRoom')->count();
        $totalPeople = Person::count();
        $this->info("People without a Person Room: {$peopleWithoutRooms} / {$totalPeople} (rooms appear on demand)");

        $nullKinds = Room::whereNull('kind')->orWhere('kind', '')->count();
        $this->info("Rooms with missing kind: {$nullKinds}");

        if ($nullKinds > 0 && $this->option('fix-kinds')) {
            $fixed = Room::whereNull('kind')->orWhere('kind', '')->update(['kind' => 'event']);
            $this->info("Backfilled kind=event on {$fixed} room(s). Existing content is untouched.");
        } elseif ($nullKinds > 0) {
            $this->line('Run with --fix-kinds to backfill kind=event on those rooms.');
        }

        return self::SUCCESS;
    }
}
