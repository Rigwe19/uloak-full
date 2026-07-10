<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsAggregationService;
use App\Services\DashboardService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected AnalyticsAggregationService $aggregation,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('dashboard/index', [
            'dashboardData' => $this->dashboardService->getDashboardData($request->user()),
            'title' => 'Dashboard - Uloak',
        ]);
    }

    public function analytics(Request $request): Response
    {
        $start = CarbonImmutable::now()->subDays(30);
        $end = CarbonImmutable::now();

        return Inertia::render('dashboard/analytics', [
            'title' => 'My Analytics - Uloak',
            'stats' => $this->aggregation->creatorStats($request->user(), $start, $end),
        ]);
    }
}
