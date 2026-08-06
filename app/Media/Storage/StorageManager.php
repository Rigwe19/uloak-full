<?php

namespace App\Media\Storage;

use App\Models\Media;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StorageManager
{
    public function __construct(
        protected string $defaultDisk = 'public',
    ) {}

    public function disk(?string $name = null): Filesystem
    {
        return Storage::disk($name ?? $this->defaultDisk);
    }

    public function store(UploadedFile $file, string $path, ?string $disk = null): string
    {
        return $file->store($path, $disk ?? $this->defaultDisk);
    }

    public function put(string $path, string $contents, ?string $disk = null): bool
    {
        return $this->disk($disk)->put($path, $contents);
    }

    public function get(string $path, ?string $disk = null): ?string
    {
        return $this->disk($disk)->get($path);
    }

    public function exists(string $path, ?string $disk = null): bool
    {
        return $this->disk($disk)->exists($path);
    }

    public function url(string $path, ?string $disk = null): string
    {
        return $this->disk($disk)->url($path);
    }

    public function path(string $path, ?string $disk = null): string
    {
        // Always use the specified disk or default to public
        $diskName = $disk ?? $this->defaultDisk;

        return Storage::disk($diskName)->path($path);
    }

    public function delete(string $path, ?string $disk = null): bool
    {
        return $this->disk($disk)->delete($path);
    }

    public function mediaPath(Media $media, ?string $disk = null): string
    {
        return $media->path;
    }

    public function mediaUrl(Media $media, ?string $disk = null): string
    {
        return $this->url($media->path, $disk ?? $media->disk);
    }

    public function deleteMedia(Media $media): bool
    {
        return $this->delete($media->path, $media->disk);
    }
}
