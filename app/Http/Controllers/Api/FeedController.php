<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedStoryResource;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room' => ['required', 'integer', 'exists:rooms,id'],
            'cursor' => ['nullable', 'integer'],
        ]);

        $query = Story::where('room_id', $validated['room'])
            ->where('type', 'video')
            ->with('user')
            ->orderBy('id', 'desc');

        if (! empty($validated['cursor'])) {
            $query->where('id', '<', $validated['cursor']);
        }

        $stories = $query->take(10)->get();

        return response()->json([
            'data' => FeedStoryResource::collection($stories),
            'next_cursor' => $stories->last()?->id,
            'has_more' => $stories->count() === 10,
        ]);
    }
}
