<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Services\AnalyticsAggregationService;
use App\Services\DashboardService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected AnalyticsAggregationService $aggregation,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $data = $this->dashboardService->getDashboardData($request->user());

        return response()->json([
            'data' => [
                'rooms' => RoomResource::collection($data['rooms']),
                'events' => $data['events'],
                'recent_stories' => $data['recentStories'],
                'stats' => $data['stats'],
                'house_members' => $data['house_members'],
                'notifications' => $data['notifications'],
            ],
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $start = CarbonImmutable::now()->subDays(30);
        $end = CarbonImmutable::now();

        return response()->json([
            'data' => $this->aggregation->creatorStats($request->user(), $start, $end),
        ]);
    }
}
