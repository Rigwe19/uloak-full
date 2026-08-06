<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsAggregationService;
use App\Services\AnalyticsExportService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAnalyticsController extends Controller
{
    protected array $allowedTabs = ['overview', 'media', 'users', 'processing'];

    public function __construct(
        protected AnalyticsAggregationService $aggregation,
        protected AnalyticsExportService $export,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/analytics', [
            'title' => 'Analytics - Ulo of Stories',
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date', 'after_or_equal:start'],
            'tab' => ['nullable', 'string', 'in:'.implode(',', $this->allowedTabs)],
        ]);

        $start = $validated['start']
            ? CarbonImmutable::parse($validated['start'])
            : CarbonImmutable::now()->subDays(30);

        $end = $validated['end']
            ? CarbonImmutable::parse($validated['end'])->endOfDay()
            : CarbonImmutable::now();

        $tab = $validated['tab'] ?? 'overview';

        $data = match ($tab) {
            'overview' => [
                'media' => $this->aggregation->mediaStats($start, $end),
                'user_stats' => $this->aggregation->userStats($start, $end),
                'room_stats' => $this->aggregation->roomStats($start, $end),
                'realtime' => $this->aggregation->realTimeStats(),
            ],
            'media' => $this->aggregation->mediaStats($start, $end),
            'users' => $this->aggregation->userStats($start, $end),
            'processing' => $this->aggregation->processingHealth($start, $end),
            default => [],
        };

        return response()->json([
            'data' => $data,
            'period' => [
                'start' => $start->toIso8601String(),
                'end' => $end->toIso8601String(),
            ],
        ]);
    }

    public function platform(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date', 'after_or_equal:start'],
        ]);

        $start = $validated['start']
            ? CarbonImmutable::parse($validated['start'])
            : CarbonImmutable::now()->subDays(30);

        $end = $validated['end']
            ? CarbonImmutable::parse($validated['end'])->endOfDay()
            : CarbonImmutable::now();

        return response()->json([
            'data' => $this->aggregation->platformMetrics($start, $end),
        ]);
    }

    public function cloudinary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date', 'after_or_equal:start'],
        ]);

        $start = $validated['start']
            ? CarbonImmutable::parse($validated['start'])
            : CarbonImmutable::now()->subDays(30);

        $end = $validated['end']
            ? CarbonImmutable::parse($validated['end'])->endOfDay()
            : CarbonImmutable::now();

        return response()->json([
            'data' => $this->aggregation->cloudinaryUsage($start, $end),
        ]);
    }

    public function realtime(): JsonResponse
    {
        return response()->json([
            'data' => $this->aggregation->realTimeStats(),
        ]);
    }

    public function export(Request $request): StreamedResponse|JsonResponse
    {
        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
            'tab' => ['required', 'string', 'in:'.implode(',', $this->allowedTabs)],
            'format' => ['required', 'string', 'in:csv,xlsx'],
        ]);

        $start = CarbonImmutable::parse($validated['start']);
        $end = CarbonImmutable::parse($validated['end'])->endOfDay();
        $tab = $validated['tab'];
        $format = $validated['format'];

        if ($format === 'csv') {
            $content = $this->export->csv($start, $end, $tab);

            return response()->streamDownload(function () use ($content): void {
                echo $content;
            }, "analytics_{$tab}_{$start->toDateString()}_{$end->toDateString()}.csv", [
                'Content-Type' => 'text/csv',
            ]);
        }

        $path = $this->export->xlsx($start, $end, $tab);

        return response()->streamDownload(function () use ($path): void {
            readfile($path);
            unlink($path);
        }, "analytics_{$tab}_{$start->toDateString()}_{$end->toDateString()}.xlsx", [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
