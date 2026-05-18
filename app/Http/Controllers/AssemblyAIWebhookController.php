<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;

class AssemblyAIWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $secret = $request->header('X-Webhook-Secret');

        // if ($secret !== config('services.assemblyai.webhook_secret')) {
        //     return response()->json(['error' => 'Unauthorized'], 401);
        // }

        $data = $request->all();

        $story = Story::where('transcript_id', $data['id'] ?? null)->first();

        if (! $story) {
            return response()->json(['error' => 'Story not found'], 404);
        }

        if (($data['status'] ?? null) === 'completed') {

            $utterances = collect($data['utterances'] ?? [])
                ->map(function ($u) {
                    return [
                        'start' => ($u['start'] ?? 0) / 1000, // ms → seconds
                        'end' => ($u['end'] ?? 0) / 1000,
                        'text' => $u['text'] ?? '',
                        'speaker' => $u['speaker'] ?? null,
                    ];
                })
                ->values()
                ->toArray();

            $story->update([
                'transcript' => $utterances, // 👈 store as JSON
                'transcript_status' => 'completed',
            ]);
        }

        if (($data['status'] ?? null) === 'error') {
            $story->update([
                'transcript_status' => 'failed',
            ]);
        }

        return response()->json(['ok' => true]);
    }
}
