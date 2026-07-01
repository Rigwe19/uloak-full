<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(Request $request): Response
    {
        logger('tributes check', [$this->dashboardService->getDashboardData($request->user())]);

        return Inertia::render('dashboard/index', [
            'dashboardData' => $this->dashboardService->getDashboardData($request->user()),
            'title' => 'Dashboard - Uloak',
        ]);
    }
}
