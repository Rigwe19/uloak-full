<?php

namespace App\Media\Repositories;

use App\Media\Enums\MediaType;
use App\Media\Exceptions\MediaNotFoundException;
use App\Models\Media;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class MediaRepository
{
    public function findById(int $id): ?Media
    {
        return Media::find($id);
    }

    public function findByUuid(string $uuid): ?Media
    {
        return Media::where('uuid', $uuid)->first();
    }

    public function findByIdOrUuid(int|string $identifier): Media
    {
        $media = is_numeric($identifier)
            ? $this->findById((int) $identifier)
            : $this->findByUuid((string) $identifier);

        if (! $media) {
            throw new MediaNotFoundException($identifier);
        }

        return $media;
    }

    public function findByCommandId(string $commandId): ?Media
    {
        return Media::where('metadata->rendi_command_id', $commandId)->first();
    }

    public function findByCloudinaryPublicId(string $publicId): ?Media
    {
        return Media::where('path', $publicId)->first();
    }

    public function createFromUpload(
        UploadedFile $file,
        string $path,
        string $disk,
        MediaType $type,
        ?int $width = null,
        ?int $height = null,
        ?string $checksum = null,
    ): Media {
        return Media::create([
            'uuid' => (string) Str::uuid(),
            'filename' => $file->hashName(),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'width' => $width,
            'height' => $height,
            'size' => $file->getSize(),
            'disk' => $disk,
            'path' => $path,
            'type' => $type->value,
            'checksum' => $checksum,
            'provider' => 'local',
        ]);
    }

    public function create(array $data): Media
    {
        return Media::create($data);
    }

    public function update(Media $media, array $data): bool
    {
        return $media->update($data);
    }

    public function delete(Media $media): ?bool
    {
        return $media->delete();
    }

    public function all(): Collection
    {
        return Media::all();
    }
}
