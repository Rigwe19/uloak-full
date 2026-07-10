<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Services\ActivityLogger;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(
        protected ActivityLogger $activityLogger,
        protected AnalyticsService $analytics,
    ) {}

    public function store(Request $request, Story $story)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
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

        $this->analytics->track('comment.created', story: $story);

        if ($request->user()) {
            $this->activityLogger->log(
                "Added comment to story: {$story->title}",
                Story::class,
                (string) $story->id,
                ['room_id' => $story->room_id]
            );
        } else {
            $this->activityLogger->logForGuest(
                "Added comment to story: {$story->title}",
                ['guest_name' => $validated['guest_name'], 'guest_email' => $validated['guest_email'] ?? null],
                Story::class,
                (string) $story->id
            );
        }

        return redirect()->back()->with('success', 'Comment added.');
    }
}
