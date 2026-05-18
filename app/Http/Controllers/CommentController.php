<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Story $story)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $story->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Comment added.');
    }
}
