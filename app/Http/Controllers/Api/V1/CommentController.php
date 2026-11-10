<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(
        protected ActivityLogger $activityLogger,
        protected AnalyticsService $analytics,
    ) {}

    public function index(Story $story): JsonResponse
    {
        $comments = $story->comments()->with(['user'])->latest()->get()->map(fn ($c) => [
            'id' => $c->id,
            'content' => $c->content,
            'parent_id' => $c->parent_id,
            'user_id' => $c->user_id,
            'author' => $c->authorName(),
            'guest_name' => $c->guest_name,
            'created_at' => $c->created_at?->toIso8601String(),
        ]);

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, Story $story): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'exists:comments,id'],
            'guest_name' => ['nullable', 'required_without:user_id', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
        ]);

        $data = [
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
        ];

        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        } else {
            $data['guest_name'] = $validated['guest_name'];
            $data['guest_email'] = $validated['guest_email'] ?? null;
        }

        $comment = $story->comments()->create($data);

        try {
            $this->analytics->track('comment.created', story: $story);
        } catch (\Throwable $e) {
        }

        if ($request->user()) {
            $this->activityLogger->log('Added comment to story: '.$story->title, Story::class, (string) $story->id, ['room_id' => $story->room_id]);
        }

        return response()->json(['data' => $comment->load('user')], 201);
    }

    public function storeShare(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'story_id' => ['required', 'exists:stories,id'],
            'content' => ['required', 'string', 'max:1000'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'guest_whatsapp' => ['nullable', 'string', 'max:30', 'regex:/^\+?[0-9\s\-\(\)]+$/'],
        ]);

        $room = Room::where('slug', $slug)->firstOrFail();
        $story = Story::where('room_id', $room->id)->findOrFail($validated['story_id']);

        $comment = $story->comments()->create([
            'user_id' => null,
            'guest_name' => $validated['guest_name'],
            'guest_email' => $validated['guest_email'] ?? null,
            'content' => $validated['content'],
        ]);

        return response()->json(['data' => $comment], 201);
    }
}
