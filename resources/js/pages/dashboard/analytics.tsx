import { Head, usePage, usePoll } from '@inertiajs/react';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react';
import { motion } from 'framer-motion';
import {
  Eye,
  Upload,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/layouts/dashboard-layout';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface StoryBreakdown {
  id: number;
  title: string;
  type: string;
  created_at: string;
  views_count: number;
  comments_count: number;
}

interface Stats {
  total_stories: number;
  total_views: number;
  total_watch_time: number;
  total_comments: number;
  unique_viewers: number;
  story_breakdown: StoryBreakdown[];
  views_over_time: Record<string, number>;
  uploads_over_time: Record<string, number>;
}

interface Props {
  stats: Stats;
}

export default function CreatorAnalytics({ stats }: Props) {
  const { url } = usePage();

  usePoll(120_000, { only: ['stats'] });
console.log(ReactEChartsCore);
  const dates = Object.keys(stats.views_over_time).length
    ? Object.keys(stats.views_over_time)
    : Object.keys(stats.uploads_over_time);

  const viewsChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Views', 'Uploads'], textStyle: { color: '#8b8fa3' } },
    grid: { left: 40, right: 16, top: 32, bottom: 24 },
    xAxis: {
      type: 'category',
      data: dates,
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
        data: dates.map((d) => stats.views_over_time[d] || 0),
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
      {
        name: 'Uploads',
        type: 'bar',
        data: dates.map((d) => stats.uploads_over_time[d] || 0),
        itemStyle: { color: '#60a5fa', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  return (
    <>
      <Head title="My Analytics - Uloak" />

      <div className="max-w-3xl md:max-w-full space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Analytics</h1>
          <p className="mt-1 text-sm text-text-muted">
            Your story performance over the last 30 days
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Stories"
            value={stats.total_stories}
            icon={Upload}
            color="text-blue-400"
          />
          <StatCard
            label="Total Views"
            value={stats.total_views}
            icon={Eye}
            color="text-amber-400"
          />
          <StatCard
            label="Watch Time"
            value={formatDuration(stats.total_watch_time)}
            icon={Clock}
            color="text-green-400"
          />
          <StatCard
            label="Comments"
            value={stats.total_comments}
            icon={MessageSquare}
            color="text-purple-400"
          />
          <StatCard
            label="Unique Viewers"
            value={stats.unique_viewers}
            icon={Users}
            color="text-cyan-400"
          />
          <StatCard
            label="Avg Views/Story"
            value={stats.total_stories > 0
              ? Math.round(stats.total_views / stats.total_stories)
              : 0}
            icon={TrendingUp}
            color="text-rose-400"
          />
        </div>

        {/* Views Chart */}
        <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Views & Uploads Over Time
          </h3>
          <ReactEChartsCore
            echarts={echarts}
            option={viewsChartOption}
            style={{ height: 300 }}
            color='green'
            notMerge
          />
        </div>

        {/* Story Breakdown Table */}
        <div className="rounded-xl border border-border-subtle bg-surface/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Your Stories
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted">
                  <th className="pb-3 pr-4 font-medium">Title</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Views</th>
                  <th className="pb-3 font-medium">Comments</th>
                </tr>
              </thead>
              <tbody>
                {stats.story_breakdown?.map((story) => (
                  <tr
                    key={story.id}
                    className="border-b border-border-subtle/50 text-text-primary"
                  >
                    <td className="py-3 pr-4">{story.title}</td>
                    <td className="py-3 pr-4 text-text-muted capitalize">
                      {story.type}
                    </td>
                    <td className="py-3 pr-4">{story.views_count}</td>
                    <td className="py-3">{story.comments_count}</td>
                  </tr>
                ))}
                {(!stats.story_breakdown ||
                  stats.story_breakdown.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-text-muted"
                    >
                      No stories yet — create your first memory!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

CreatorAnalytics.layout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface/90 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        <Icon className={`size-5 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-bold text-text-primary">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
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
