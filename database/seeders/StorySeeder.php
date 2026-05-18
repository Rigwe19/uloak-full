<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\Story;
use App\Models\User;
use Illuminate\Database\Seeder;

class StorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@uloak.com')->first();
        $user = User::where('email', 'user@uloak.com')->first();
        $room = Room::first();

        if (! $admin || ! $user || ! $room) {
            return;
        }

        $stories = [
            [
                'room_id' => $room->id,
                'user_id' => $user->id,
                'title' => 'Grandma\'s Wedding Story',
                'thumbnail' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
                'type' => 'video',
                'description' => 'A beautiful retelling of Grandma and Grandpa\'s wedding day in Benin City, 1968.',
                'duration' => '12:45',
                'tags' => ['Wedding', 'Nigeria', 'Family'],
            ],
            [
                'room_id' => $room->id,
                'user_id' => $admin->id,
                'title' => 'The First Journey to Lagos',
                'thumbnail' => 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80',
                'type' => 'video',
                'description' => 'Archive footage and narration about the family\'s first relocation to the coastal city.',
                'duration' => '08:20',
                'tags' => ['Travel', 'Lagos', 'History'],
            ],
            [
                'room_id' => $room->id,
                'user_id' => $user->id,
                'title' => 'Arrival in London, 1974',
                'thumbnail' => 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
                'type' => 'photo',
                'description' => 'A restored polaroid from the cold January morning the family landed at Heathrow.',
                'tags' => ['Migration', 'London', 'Archives'],
            ],
        ];

        foreach ($stories as $storyData) {
            Story::create($storyData);
        }
    }
}
