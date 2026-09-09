<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HouseMemberResource;
use App\Http\Resources\RoomResource;
use App\Models\HouseMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HouseAccessController extends Controller
{
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate(['token' => ['required', 'string', 'size:64']]);
        $member = HouseMember::where('access_token', $validated['token'])->first();

        if (! $member) {
            return response()->json(['message' => 'Invalid or expired house token.'], 404);
        }

        $rooms = $member->owner->rooms()->withCount(['stories', 'tributes'])->latest()->get();

        return response()->json([
            'data' => [
                'house_member' => new HouseMemberResource($member),
                'owner' => ['id' => $member->owner->id, 'name' => $member->owner->name],
                'rooms' => RoomResource::collection($rooms),
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $members = $request->user()->houseMembers()->latest()->get();

        return response()->json(['data' => HouseMemberResource::collection($members)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255']]);
        $member = $request->user()->houseMembers()->create($validated);

        return response()->json(['data' => new HouseMemberResource($member)], 201);
    }

    public function destroy(HouseMember $houseMember): JsonResponse
    {
        abort_unless($houseMember->owner_id === auth()->id(), 403);
        $houseMember->delete();

        return response()->json(['message' => 'House member removed.']);
    }
}
