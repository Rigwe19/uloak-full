import { Head, router } from '@inertiajs/react';
import { LineChart, BarChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { motion } from 'framer-motion';
import {
    BarChart3,
    CalendarIcon,
    Download,
    Eye,
    Users,
    Upload,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Play,
    Pause,
    AlertTriangle,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticsPolling } from '@/hooks/use-analytics-polling';
import AdminLayout from '@/layouts/admin-layout';

echarts.use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    CanvasRenderer,
]);

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'media', label: 'Media' },
    { id: 'users', label: 'Users' },
    { id: 'processing', label: 'Processing' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminAnalytics() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(Date.now() - 29 * 86400000),
        to: new Date(),
    });
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) {
            return;
        }

        const params = new URLSearchParams({
            start: dateRange.from.toISOString(),
            end: dateRange.to.toISOString(),
            tab: activeTab,
        });

        try {
            const res = await fetch(`/admin/analytics/data?${params}`);
            const json = await res.json();
            setData(json.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [dateRange, activeTab]);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    useAnalyticsPolling(fetchData);

    const handleExport = async (format: 'csv' | 'xlsx') => {
        if (!dateRange?.from || !dateRange?.to) {
            return;
        }

        setExporting(true);

        const params = new URLSearchParams({
            start: dateRange.from.toISOString(),
            end: dateRange.to.toISOString(),
            tab: activeTab,
            format,
        });

        try {
            const res = await fetch(`/admin/analytics/export?${params}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics_${activeTab}_${format}`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Analytics - Ulo of Stories" />

            <div className="mx-auto max-w-7xl space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            Analytics
                        </h1>
                        <p className="mt-1 text-sm text-text-muted">
                            Platform metrics and media insights
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                        />

                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('csv')}
                                disabled={exporting || loading}
                            >
                                <Download className="mr-1 size-4" />
                                CSV
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExport('xlsx')}
                                disabled={exporting || loading}
                            >
                                <Download className="mr-1 size-4" />
                                XLSX
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border-subtle">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-accent-gold'
                                    : 'text-text-muted hover:text-text-primary'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="analytics-tab"
                                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-accent-gold"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-28 rounded-xl" />
                            ))}
                        </div>
                        <Skeleton className="h-80 rounded-xl" />
                    </div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <OverviewTab data={data} />
                        )}
                        {activeTab === 'media' && <MediaTab data={data} />}
                        {activeTab === 'users' && <UsersTab data={data} />}
                        {activeTab === 'processing' && (
                            <ProcessingTab data={data} />
                        )}
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
}

AdminAnalytics.layout = (page: React.ReactNode) => page;

function StatCard({
    label,
    value,
    icon: Icon,
    color,
    suffix,
}: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    suffix?: string;
}) {
    return (
        <div className="rounded-xl border border-border-subtle bg-surface/50 p-5">
            <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{label}</span>
                <Icon className={`size-5 ${color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-text-primary">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && (
                    <span className="ml-1 text-sm font-normal text-text-muted">
                        {suffix}
                    </span>
                )}
            </p>
        </div>
    );
}

function OverviewTab({ data }: { data: any }) {
    if (!data) {
        return null;
    }

    const { media, user_stats, room_stats, realtime } = data;

    const viewsChart = {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 16, bottom: 24 },
        xAxis: {
            type: 'category',
            data: Object.keys(media.views_over_time || {}),
            axisLabel: { color: '#8b8fa3', fontSize: 11 },
            axisLine: { lineStyle: { color: '#2a2a3a' } },
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#2a2a3a', type: 'dashed' } },
            axisLabel: { color: '#8b8fa3', fontSize: 11 },
        },
        series: [
            {
                name: 'Views',
                type: 'line',
                data: Object.values(media.views_over_time || {}),
                smooth: true,
                lineStyle: { color: '#c4a35a', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(196, 163, 90, 0.2)' },
                        { offset: 1, color: 'rgba(196, 163, 90, 0)' },
                    ]),
                },
                symbol: 'none',
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Views"
                    value={media.total_views}
                    icon={Eye}
                    color="text-blue-400"
                />
                <StatCard
                    label="Unique Viewers"
                    value={media.unique_viewers}
                    icon={Users}
                    color="text-purple-400"
                />
                <StatCard
                    label="Watch Time"
                    value={formatDuration(media.total_watch_time)}
                    icon={Clock}
                    color="text-green-400"
                />
                <StatCard
                    label="Completion Rate"
                    value={media.completion_rate}
                    icon={CheckCircle2}
                    color="text-emerald-400"
                    suffix="%"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Uploads"
                    value={media.uploads}
                    icon={Upload}
                    color="text-amber-400"
                />
                <StatCard
                    label="Active Users"
                    value={user_stats.active_users}
                    icon={TrendingUp}
                    color="text-cyan-400"
                />
                <StatCard
                    label="Active Rooms"
                    value={room_stats.active_rooms}
                    icon={BarChart3}
                    color="text-rose-400"
                />
                <StatCard
                    label="Active Sessions"
                    value={realtime.active_sessions}
                    icon={Activity}
                    color="text-indigo-400"
                />
            </div>

            {/* Views Over Time Chart */}
            <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">
                    Views Over Time
                </h3>
                <ReactEChartsCore
                    echarts={echarts}
                    option={viewsChart}
                    style={{ height: 320 }}
                    notMerge
                />
            </div>
        </div>
    );
}

function MediaTab({ data }: { data: any }) {
    if (!data) {
        return null;
    }

    const topStories = data.top_stories || [];
    const viewsOverTime = data.views_over_time || {};
    const uploadsOverTime = data.uploads_over_time || {};

    const dates = Object.keys(viewsOverTime).length
        ? Object.keys(viewsOverTime)
        : Object.keys(uploadsOverTime);

    const chartOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Views', 'Uploads'], textStyle: { color: '#8b8fa3' } },
        grid: { left: 40, right: 16, top: 32, bottom: 24 },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: { color: '#8b8fa3', fontSize: 11 },
            axisLine: { lineStyle: { color: '#2a2a3a' } },
        },
        yAxis: [
            {
                type: 'value',
                splitLine: { lineStyle: { color: '#2a2a3a', type: 'dashed' } },
                axisLabel: { color: '#8b8fa3', fontSize: 11 },
            },
        ],
        series: [
            {
                name: 'Views',
                type: 'bar',
                data: dates.map((d: string) => viewsOverTime[d] || 0),
                itemStyle: { color: '#c4a35a', borderRadius: [4, 4, 0, 0] },
            },
            {
                name: 'Uploads',
                type: 'line',
                data: dates.map((d: string) => uploadsOverTime[d] || 0),
                lineStyle: { color: '#60a5fa', width: 2 },
                symbol: 'diamond',
                symbolSize: 8,
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Views"
                    value={data.total_views}
                    icon={Eye}
                    color="text-blue-400"
                />
                <StatCard
                    label="Unique Viewers"
                    value={data.unique_viewers}
                    icon={Users}
                    color="text-purple-400"
                />
                <StatCard
                    label="Watch Time"
                    value={formatDuration(data.total_watch_time)}
                    icon={Clock}
                    color="text-green-400"
                />
                <StatCard
                    label="Uploads"
                    value={data.uploads}
                    icon={Upload}
                    color="text-amber-400"
                />
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">
                    Views & Uploads
                </h3>
                <ReactEChartsCore
                    echarts={echarts}
                    option={chartOption}
                    style={{ height: 320 }}
                    notMerge
                />
            </div>

            {/* Top Stories Table */}
            <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">
                    Top Stories
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border-subtle text-text-muted">
                                <th className="pr-4 pb-3 font-medium">Title</th>
                                <th className="pr-4 pb-3 font-medium">Views</th>
                                <th className="pb-3 font-medium">Watch Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topStories.map((story: any) => (
                                <tr
                                    key={story.id}
                                    className="border-b border-border-subtle/50 text-text-primary"
                                >
                                    <td className="py-3 pr-4">{story.title}</td>
                                    <td className="py-3 pr-4">
                                        {story.views.toLocaleString()}
                                    </td>
                                    <td className="py-3">
                                        {formatDuration(story.watch_time)}
                                    </td>
                                </tr>
                            ))}
                            {topStories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-8 text-center text-text-muted"
                                    >
                                        No data yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function UsersTab({ data }: { data: any }) {
    if (!data) {
        return null;
    }

    const usersOverTime = data.users_over_time || {};

    const chartOption = {
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 16, top: 16, bottom: 24 },
        xAxis: {
            type: 'category',
            data: Object.keys(usersOverTime),
            axisLabel: { color: '#8b8fa3', fontSize: 11 },
            axisLine: { lineStyle: { color: '#2a2a3a' } },
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#2a2a3a', type: 'dashed' } },
            axisLabel: { color: '#8b8fa3', fontSize: 11 },
        },
        series: [
            {
                name: 'New Users',
                type: 'bar',
                data: Object.values(usersOverTime),
                itemStyle: { color: '#818cf8', borderRadius: [4, 4, 0, 0] },
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="New Users"
                    value={data.new_users}
                    icon={Users}
                    color="text-indigo-400"
                />
                <StatCard
                    label="Total Users"
                    value={data.total_users}
                    icon={Users}
                    color="text-blue-400"
                />
                <StatCard
                    label="Active Users"
                    value={data.active_users}
                    icon={Activity}
                    color="text-green-400"
                />
                <StatCard
                    label="Sessions"
                    value={data.sessions}
                    icon={Play}
                    color="text-cyan-400"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                    label="Guest Viewers"
                    value={data.guest_viewers}
                    icon={Eye}
                    color="text-amber-400"
                />
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">
                    New Users Over Time
                </h3>
                <ReactEChartsCore
                    echarts={echarts}
                    option={chartOption}
                    style={{ height: 320 }}
                    notMerge
                />
            </div>

            {/* Top Contributors Table */}
            <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">
                    Top Contributors
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border-subtle text-text-muted">
                                <th className="pr-4 pb-3 font-medium">Name</th>
                                <th className="pb-3 font-medium">Stories</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_contributors?.map((c: any) => (
                                <tr
                                    key={c.id}
                                    className="border-b border-border-subtle/50 text-text-primary"
                                >
                                    <td className="py-3 pr-4">{c.name}</td>
                                    <td className="py-3">{c.stories}</td>
                                </tr>
                            ))}
                            {(!data.top_contributors ||
                                data.top_contributors.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="py-8 text-center text-text-muted"
                                    >
                                        No contributors yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ProcessingTab({ data }: { data: any }) {
    if (!data) {
        return null;
    }

    const failuresByDate = data.failures_over_time || {};

    const chartOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Failures'], textStyle: { color: '#8b8fa3' } },
        grid: { left: 40, right: 16, top: 32, bottom: 24 },
        xAxis: {
            type: 'category',
            data: Object.keys(failuresByDate),
            axisLabel: { color: '#8b8fa3', fontSize: 11 },
            axisLine: { lineStyle: { color: '#2a2a3a' } },
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#2a2a3a', type: 'dashed' } },
            axisLabel: { color: '#8b8fa3', fontSize: 11 },
        },
        series: [
            {
                name: 'Failures',
                type: 'bar',
                data: Object.values(failuresByDate),
                itemStyle: { color: '#f87171', borderRadius: [4, 4, 0, 0] },
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Jobs"
                    value={data.total_jobs}
                    icon={Activity}
                    color="text-blue-400"
                />
                <StatCard
                    label="Successful"
                    value={data.successful}
                    icon={CheckCircle2}
                    color="text-green-400"
                />
                <StatCard
                    label="Failed"
                    value={data.failed}
                    icon={XCircle}
                    color="text-red-400"
                />
                <StatCard
                    label="Avg Duration"
                    value={data.avg_duration_ms ?? 'N/A'}
                    icon={Clock}
                    color="text-amber-400"
                    suffix="ms"
                />
            </div>

            {Object.keys(failuresByDate).length > 0 && (
                <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
                    <h3 className="mb-4 text-sm font-semibold text-text-primary">
                        Failures Over Time
                    </h3>
                    <ReactEChartsCore
                        echarts={echarts}
                        option={chartOption}
                        style={{ height: 320 }}
                        notMerge
                    />
                </div>
            )}

            {/* Recent Failures Table */}
            <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">
                    Recent Failures
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border-subtle text-text-muted">
                                <th className="pr-4 pb-3 font-medium">Media</th>
                                <th className="pr-4 pb-3 font-medium">
                                    Exception
                                </th>
                                <th className="pr-4 pb-3 font-medium">
                                    Retries
                                </th>
                                <th className="pb-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_failures?.map((f: any) => (
                                <tr
                                    key={f.id}
                                    className="border-b border-border-subtle/50 text-text-primary"
                                >
                                    <td className="py-3 pr-4">
                                        {f.media_name}
                                    </td>
                                    <td className="py-3 pr-4 font-mono text-xs text-red-400">
                                        {f.exception}
                                    </td>
                                    <td className="py-3 pr-4">
                                        {f.retry_count}
                                    </td>
                                    <td className="py-3 text-text-muted">
                                        {f.created_at}
                                    </td>
                                </tr>
                            ))}
                            {(!data.recent_failures ||
                                data.recent_failures.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 text-center text-text-muted"
                                    >
                                        No recent failures
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) {
        return '0s';
    }

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];

    if (h > 0) {
        parts.push(`${h}h`);
    }

    if (m > 0) {
        parts.push(`${m}m`);
    }

    if (s > 0 || parts.length === 0) {
        parts.push(`${s}s`);
    }

    return parts.join(' ');
}
