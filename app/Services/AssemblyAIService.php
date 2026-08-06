<?php

namespace App\Services;

use Auth;
use Illuminate\Support\Facades\Http;

class AssemblyAIService
{
    private string $baseUrl = 'https://api.assemblyai.com/v2';

    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.assemblyai.key');
    }

    public function uploadFile(string $filePath): string
    {
        $response = Http::withHeaders([
            'authorization' => $this->apiKey,
        ])->withBody(
            file_get_contents($filePath),
            'application/octet-stream'
        )->post("{$this->baseUrl}/upload");

        return $response->json()['upload_url'];
    }

    public function createTranscript(string $audioUrl, string $webhookUrl): string
    {
        $response = Http::withHeaders([
            'authorization' => $this->apiKey,
            'content-type' => 'application/json',
        ])->post("{$this->baseUrl}/transcript", [
            'audio_url' => $audioUrl,
            'speech_models' => ['universal-3-pro', 'universal-2'],

            // 🔥 IMPORTANT FOR YOUR UI
            'punctuate' => true,
            'format_text' => true,

            // for speaker labels (your UI supports it)
            'speaker_labels' => true,
            'speaker_options' => [
                'min_speakers_expected' => 1,
                'max_speakers_expected' => 3,
            ],

            'speech_understanding' => [
                'request' => [
                    'speaker_identification' => [
                        'speaker_type' => 'name',
                        'known_values' => [Auth::user()->name],
                    ],
                ],
            ],

            // optional but useful for sync UI
            'word_boost' => [],
            'webhook_url' => 'https://uloofstories.com/api/webhooks/assemblyai', // $webhookUrl, // 'https://webhook.site/bd44e705-5a6e-475f-9a74-997b2d646c3b', // ,
        ]);
        logger('assembly.info', $response->json());

        return $response->json()['id'];
    }

    /**
     * Create a transcription job without a webhook (used for polling in queued jobs).
     */
    public function createTranscriptSimple(string $audioUrl): string
    {
        $response = Http::withHeaders([
            'authorization' => $this->apiKey,
            'content-type' => 'application/json',
        ])->post("{$this->baseUrl}/transcript", [
            'audio_url' => $audioUrl,
            'punctuate' => true,
            'format_text' => true,
        ]);

        return $response->json()['id'];
    }

    /**
     * Poll a transcript by ID and return its status + text.
     *
     * @return array{status: string, text: string|null}
     */
    public function getTranscript(string $transcriptId): array
    {
        $response = Http::withHeaders([
            'authorization' => $this->apiKey,
        ])->get("{$this->baseUrl}/transcript/{$transcriptId}");

        return $response->json();
    }
}
