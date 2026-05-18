<?php

namespace App\Jobs;

use App\Models\Story;
use App\Services\AssemblyAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessStoryTranscription implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $storyId,
        public string $filePath
    ) {}

    public function handle(AssemblyAIService $assemblyAI)
    {
        $story = Story::find($this->storyId);

        if (! $story) {
            return;
        }

        $story->update([
            'transcript_status' => 'processing',
        ]);

        // 1. Upload
        $audioUrl = $assemblyAI->uploadFile($this->filePath);

        // 2. Create transcript job
        $transcriptId = $assemblyAI->createTranscript($audioUrl);

        $story->update([
            'transcript_id' => $transcriptId,
        ]);

        // 3. Poll until complete
        while (true) {
            $result = $assemblyAI->getTranscript($transcriptId);

            if ($result['status'] === 'completed') {
                $story->update([
                    'transcript' => $result['text'] ?? '',
                    'transcript_status' => 'completed',
                ]);
                break;
            }

            if ($result['status'] === 'error') {
                $story->update([
                    'transcript_status' => 'failed',
                ]);
                break;
            }

            sleep(3);
        }
    }
}
