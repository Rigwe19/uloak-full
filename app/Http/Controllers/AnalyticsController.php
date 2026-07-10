<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(protected AnalyticsService $analytics) {}

    public function view(Request $request, Story $story): JsonResponse
    {
        $validated = $request->validate([
            'watch_time' => 'nullable|integer|min:0',
            'completed' => 'nullable|boolean',
            'session_id' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:2',
            'referrer' => 'nullable|string|max:500',
            'playback_events' => 'nullable|array',
        ]);

        $view = $this->analytics->recordView($story, $validated);

        $this->analytics->track('story.viewed', story: $story, properties: [
            'session_id' => $validated['session_id'] ?? null,
        ]);

        return response()->json(['data' => $view], 201);
    }

    public function playback(Request $request, Story $story): JsonResponse
    {
        $validated = $request->validate([
            'event' => 'required|string|in:play,pause,seek,ended,error',
            'position' => 'nullable|numeric|min:0',
            'session_id' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $this->analytics->track('playback.'.$validated['event'], story: $story, properties: [
            'session_id' => $validated['session_id'] ?? null,
            'metadata' => array_merge(
                ['position' => $validated['position'] ?? null],
                $validated['metadata'] ?? [],
            ),
        ]);

        return response()->json(['status' => 'ok']);
    }
}
