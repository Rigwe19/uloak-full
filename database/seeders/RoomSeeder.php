<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@ulo of stories.com')->first();
        $user = User::where('email', 'user@ulo of stories.com')->first();

        if (! $admin || ! $user) {
            return;
        }

        $rooms = [
            [
                'name' => 'Elders\' Voices',
                'thumbnail' => 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
                'description' => 'Oral histories and wisdom from our family veterans.',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Cultural Roots',
                'thumbnail' => 'https://images.unsplash.com/photo-1523733566457-60d397e4205c?w=800&q=80',
                'description' => 'Documenting our traditions, recipes, and ancestral home.',
                'created_by' => $admin->id,
            ],
            [
                'name' => 'The Diaspora Journey',
                'thumbnail' => 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
                'description' => 'Migration stories, first impressions, and building a new life.',
                'created_by' => $user->id,
            ],
            [
                'name' => 'Legacy Films',
                'thumbnail' => 'https://images.unsplash.com/photo-1492691523567-6119201a3bb6?w=800&q=80',
                'description' => 'Professionally curated cinematic family documentaries.',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($rooms as $roomData) {
            $room = Room::create($roomData);
            $room->members()->attach([$admin->id, $user->id]);
        }
    }
}
