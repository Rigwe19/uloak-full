<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MediaFactory extends Factory
{
    protected $model = Media::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['image', 'video']);
        $ext = $type === 'image' ? 'jpg' : 'mp4';
        $filename = Str::uuid().'.'.$ext;

        return [
            'uuid' => (string) Str::uuid(),
            'filename' => $filename,
            'original_name' => fake()->word().'.'.$ext,
            'mime_type' => $type === 'image' ? 'image/jpeg' : 'video/mp4',
            'extension' => $ext,
            'width' => $type === 'image' ? fake()->numberBetween(200, 4000) : null,
            'height' => $type === 'image' ? fake()->numberBetween(200, 4000) : null,
            'size' => fake()->numberBetween(1024, 10485760),
            'disk' => 'public',
            'path' => 'media/originals/'.$filename,
            'type' => $type,
            'checksum' => Str::random(32),
            'status' => null,
            'provider' => 'local',
            'thumbnail' => null,
            'preview' => null,
            'sprite' => null,
            'duration' => null,
            'aspect_ratio' => null,
            'failed_reason' => null,
            'retry_count' => 0,
            'metadata' => null,
        ];
    }

    public function image(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'image',
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
        ]);
    }

    public function video(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'video',
            'mime_type' => 'video/mp4',
            'extension' => 'mp4',
            'width' => null,
            'height' => null,
        ]);
    }

    public function cloudinary(): static
    {
        return $this->state(fn (array $attributes): array => [
            'disk' => 'cloudinary',
            'provider' => 'cloudinary',
            'cloudinary_public_id' => 'story_video_'.now()->format('Ymd_His').'_'.substr((string) Str::uuid(), 0, 8),
            'status' => 'uploading',
            'path' => 'https://res.cloudinary.com/example/video/upload/v1/stories/videos/1/2026/07/'.Str::uuid().'.mp4',
        ]);
    }
}
