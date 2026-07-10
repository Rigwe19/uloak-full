<?php

namespace App\Media\Contracts;

use App\Models\Media;
use Illuminate\Http\UploadedFile;

interface ImageProcessor
{
    public function upload(UploadedFile $file): Media;

    public function process(Media $media, array $operations): string;

    public function processStream(Media $media, array $operations): string;

    public function supports(string $mimeType): bool;
}
