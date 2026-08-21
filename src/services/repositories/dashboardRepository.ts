import { env } from '@/config/environment';
import { getMockDashboardSummary } from '@/mock-data/dashboard';
import { axiosClient } from '@/services/api/axiosClient';
import { getRuns } from '@/services/repositories/classificationRepository';
import { RUN_STATUS_ORDER } from '@/constants/dashboard';
import type { ClassificationRun } from '@/types/run';
import type { DashboardData, DashboardDateRange, DashboardSummary, DashboardTrendData } from '@/types/dashboard';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (env.useMockData) {
    return delay(getMockDashboardSummary());
  }
  const response = await axiosClient.get<DashboardSummary>('/dashboard/summary');
  return response.data;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function buildDashboardData(runs: ClassificationRun[], range: DashboardDateRange): DashboardData {
  const totalLineItems = runs.reduce((sum, run) => sum + run.totalLineItems, 0);
  const summary: DashboardSummary = {
    totalRuns: runs.length,
    totalLineItems,
    inReview: runs.filter((run) => run.status === 'IN_REVIEW' || run.status === 'READY_FOR_REVIEW').length,
    finalizedRuns: runs.filter((run) => run.status === 'FINALIZED').length,
    failedRuns: runs.filter((run) => run.status === 'FAILED').length,
  };

  const statusCounts = runs.reduce<Record<string, number>>((counts, run) => {
    counts[run.status] = (counts[run.status] ?? 0) + 1;
    return counts;
  }, {});

  const monthlyCounts = runs.reduce<Record<string, number>>((counts, run) => {
    const month = run.createdAt.slice(0, 7);
    counts[month] = (counts[month] ?? 0) + 1;
    return counts;
  }, {});

  const sortedDates = runs.map((run) => run.createdAt.slice(0, 10)).sort();
  const start = range.startDate ?? sortedDates[0];
  const end = range.endDate ?? sortedDates[sortedDates.length - 1];
  const dailyCounts = runs.reduce<Record<string, number>>((counts, run) => {
    const date = run.createdAt.slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
    return counts;
  }, {});

  const dailyRuns: DashboardData['dailyRuns'] = [];
  let cumulative = 0;
  if (start && end) {
    let cursor = new Date(`${start}T00:00:00.000Z`);
    const last = new Date(`${end}T00:00:00.000Z`);
    while (cursor <= last) {
      const date = toDateKey(cursor);
      const count = dailyCounts[date] ?? 0;
      cumulative += count;
      dailyRuns.push({ date, count, cumulative });
      cursor = addDays(cursor, 1);
    }
  }

  return {
    summary,
    runStatusBreakdown: RUN_STATUS_ORDER.map((status) => ({ status, count: statusCounts[status] ?? 0 })),
    lineItemOutcome: {
      reviewed: runs.reduce((sum, run) => sum + run.reviewedLineItems, 0),
      inReview: runs.reduce((sum, run) => sum + Math.max(run.totalLineItems - run.reviewedLineItems, 0), 0),
    },
    monthlyRuns: Object.entries(monthlyCounts).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
    dailyRuns,
  };
}

export function selectDashboardTrend(data: DashboardData, month?: string): DashboardTrendData {
  if (!month) return { monthlyRuns: data.monthlyRuns, dailyRuns: data.dailyRuns };

  const dailyRuns = data.dailyRuns.filter((point) => point.date.startsWith(month));
  let cumulative = 0;
  return {
    monthlyRuns: data.monthlyRuns.filter((point) => point.month === month),
    dailyRuns: dailyRuns.map((point) => {
      cumulative += point.count;
      return { ...point, cumulative };
    }),
  };
}

export async function getDashboardData(range: DashboardDateRange = {}): Promise<DashboardData> {
  if (!env.useMockData) {
    const response = await axiosClient.get<DashboardData>('/dashboard', { params: range });
    return response.data;
  }

  const result = await getRuns({ ...range, page: 1, pageSize: 1000 });
  return delay(buildDashboardData(result.runs, range));
}
