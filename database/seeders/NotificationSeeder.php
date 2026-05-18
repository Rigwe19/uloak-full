<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            return;
        }

        $notifications = [
            [
                'id' => Str::uuid(),
                'type' => 'App\Notifications\NewStoryNotification',
                'data' => [
                    'title' => 'New Story Added',
                    'message' => 'Sarah shared a new story "The Old Willow Tree" in the Heritage Hall.',
                    'icon' => 'MessageSquare',
                    'category' => 'story',
                ],
                'read_at' => null,
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\Notifications\NewMemberNotification',
                'data' => [
                    'title' => 'New Member Joined',
                    'message' => 'James Adeyemi has joined your family house.',
                    'icon' => 'User',
                    'category' => 'member',
                ],
                'read_at' => null,
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\Notifications\SystemNotification',
                'data' => [
                    'title' => 'Archive Backup Complete',
                    'message' => 'Your monthly house archive has been successfully backed up to the cloud.',
                    'icon' => 'ShieldCheck',
                    'category' => 'system',
                ],
                'read_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\Notifications\NewStoryNotification',
                'data' => [
                    'title' => 'New Photo Added',
                    'message' => 'Adebayo added 5 new photos to the 1974 Arrival collection.',
                    'icon' => 'Camera',
                    'category' => 'story',
                ],
                'read_at' => null,
            ],
        ];

        foreach ($notifications as $notification) {
            $user->notifications()->create($notification);
        }
    }
}
