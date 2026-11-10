<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomMember;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomMemberController extends Controller
{
    public function __construct(protected ActivityLogger $activityLogger) {}

    public function index(Request $request, Room $room): JsonResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);

        $members = $room->familyMembers()->latest()->get()->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'relationship' => $m->relationship,
            'access_url' => $request->getSchemeAndHttpHost().'/house/access/'.$m->access_token,
            'access_token' => $m->access_token,
            'created_at' => $m->created_at?->toIso8601String(),
        ]);

        return response()->json(['data' => $members]);
    }

    public function store(Request $request, Room $room): JsonResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:255'],
        ]);

        $member = $room->familyMembers()->create($validated);

        $this->activityLogger->log(
            "Added family member to room: {$room->name}",
            RoomMember::class,
            (string) $member->id,
            ['room_id' => $room->id, 'room_name' => $room->name, 'member_name' => $member->name]
        );

        return response()->json([
            'data' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'relationship' => $member->relationship,
                'access_url' => $request->getSchemeAndHttpHost().'/house/access/'.$member->access_token,
                'access_token' => $member->access_token,
            ],
            'message' => 'Family member added!',
        ], 201);
    }

    public function destroy(Room $room, RoomMember $member): JsonResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);
        abort_if($member->room_id !== $room->id, 404);

        $memberName = $member->name;
        $memberId = $member->getKey();
        $member->delete();

        $this->activityLogger->log(
            "Removed family member from room: {$room->name}",
            RoomMember::class,
            (string) $memberId,
            ['room_id' => $room->id, 'room_name' => $room->name, 'member_name' => $memberName]
        );

        return response()->json(['message' => 'Family member removed.']);
    }

    public function regenerateToken(Request $request, Room $room, RoomMember $member): JsonResponse
    {
        abort_unless($room->created_by === auth()->id(), 403);
        abort_if($member->room_id !== $room->id, 404);

        $member->regenerateToken();

        $this->activityLogger->log(
            "Regenerated access token for member: {$member->name} in room: {$room->name}",
            RoomMember::class,
            (string) $member->getKey(),
            ['room_id' => $room->id, 'room_name' => $room->name, 'member_name' => $member->name]
        );

        return response()->json([
            'data' => [
                'id' => $member->id,
                'access_token' => $member->access_token,
                'access_url' => $request->getSchemeAndHttpHost().'/house/access/'.$member->access_token,
            ],
            'message' => 'New access link generated.',
        ]);
    }
}
