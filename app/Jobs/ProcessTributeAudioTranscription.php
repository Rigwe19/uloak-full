<?php

namespace App\Jobs;

use App\Models\Tribute;
use App\Services\AssemblyAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessTributeAudioTranscription implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Tribute $tribute
    ) {}

    public function handle(AssemblyAIService $assemblyAI): void
    {
        $tribute = $this->tribute->fresh();

        if (! $tribute || ! $tribute->audio) {
            return;
        }

        $tribute->update(['audio_transcript_status' => 'processing']);

        // Resolve the absolute disk path from the stored public path
        // e.g. /tributes/1/audio/tribute_xxx.webm -> storage/app/public/tributes/...
        $relativePath = ltrim($tribute->audio, '/');
        $absolutePath = Storage::disk('public')->path($relativePath);

        if (! file_exists($absolutePath)) {
            $tribute->update(['audio_transcript_status' => 'failed']);

            return;
        }

        // Convert WebM/Opus to MP3 — AssemblyAI doesn't support WebM from phones
        $convertedPath = null;
        $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));
        if (in_array($extension, ['webm', 'ogg'])) {
            $convertedPath = dirname($absolutePath).'/'.pathinfo($absolutePath, PATHINFO_FILENAME).'_converted.mp3';
            $command = sprintf(
                'ffmpeg -y -i %s -vn -acodec libmp3lame -ab 128k -ar 44100 %s 2>/dev/null',
                escapeshellarg($absolutePath),
                escapeshellarg($convertedPath),
            );
            exec($command, $output, $exitCode);
            if ($exitCode !== 0) {
                Log::error('AssemblyAI: FFmpeg conversion failed', [
                    'exit_code' => $exitCode,
                    'input' => $absolutePath,
                ]);
                $tribute->update(['audio_transcript_status' => 'failed']);

                return;
            }
            $uploadPath = $convertedPath;
        } else {
            $uploadPath = $absolutePath;
        }

        // 1. Upload file to AssemblyAI
        $audioUrl = $assemblyAI->uploadFile($uploadPath);

        // Clean up converted temp file
        if ($convertedPath && file_exists($convertedPath)) {
            unlink($convertedPath);
        }

        // 2. Request transcription (no webhook needed — we poll here)
        $transcriptId = $assemblyAI->createTranscriptSimple($audioUrl);

        $tribute->update(['audio_transcript_id' => $transcriptId]);

        // 3. Poll until complete
        for ($i = 0; $i < 60; $i++) {
            $result = $assemblyAI->getTranscript($transcriptId);

            if ($result['status'] === 'completed') {
                $tribute->update([
                    'audio_transcript' => $result['text'] ?? '',
                    'audio_transcript_status' => 'completed',
                ]);

                return;
            }

            if ($result['status'] === 'error') {
                $tribute->update(['audio_transcript_status' => 'failed']);

                return;
            }

            sleep(4);
        }

        // Timed out
        $tribute->update(['audio_transcript_status' => 'failed']);
    }
}
