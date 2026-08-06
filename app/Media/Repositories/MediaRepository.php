<?php

namespace App\Media\Repositories;

use App\Media\Enums\MediaType;
use App\Media\Enums\ProcessingState;
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

    public function createFromUpload(
        UploadedFile $file,
        string $path,
        string $disk,
        MediaType $type,
        ?string $checksum = null,
        ?int $width = null,
        ?int $height = null,
        ?int $duration = null,
        ?string $thumbnailPath = null,
        ?string $spritePath = null,
        ?string $spriteVttPath = null,
        ?string $status = null,
        ?string $processingStartedAt = null,
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
            'duration' => $duration,
            'disk' => $disk,
            'path' => $path,
            'type' => $type->value,
            'checksum' => $checksum,
            'provider' => 'local',
            'thumbnail' => $thumbnailPath,
            'sprite' => ['image' => $spritePath, 'vtt' => $spriteVttPath],
            'status' => $status ?? ProcessingState::Uploading->value,
            'processing_started_at' => $processingStartedAt,
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
