import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import { Activity, BarChart3, CalendarDays, CheckCircle2, Clock, FileStack, ListChecks, RefreshCw, TrendingUp, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryCard } from '@/components/common/SummaryCard';
import { SectionCard } from '@/components/common/SectionCard';
import { DonutChart, DonutLegend, type DonutSegment } from '@/components/common/DonutChart';
import { MonthlyRunsChart, DailyRunsChart } from '@/components/common/DashboardCharts';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { getDashboardData, selectDashboardTrend } from '@/services/repositories/dashboardRepository';
import { RUN_STATUS_LABEL, RUN_STATUS_CHART_COLOR, LINE_ITEM_STATUS_LABEL, LINE_ITEM_STATUS_CHART_COLOR } from '@/constants/statuses';
import { RUN_STATUS_ORDER } from '@/constants/dashboard';
import type { DashboardData, DashboardDateRange } from '@/types/dashboard';

const { RangePicker } = DatePicker;

export function DashboardPage() {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [trendMonth, setTrendMonth] = useState<string | undefined>();

  const queryRange = useMemo<DashboardDateRange>(() => ({
    startDate: dateRange[0]?.format('YYYY-MM-DD'),
    endDate: dateRange[1]?.format('YYYY-MM-DD'),
  }), [dateRange]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDashboardData(queryRange)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load dashboard. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryRange, refreshToken]);

  const runStatusSegments: DonutSegment[] = useMemo(() => (
    data?.runStatusBreakdown.map(({ status, count }) => ({
      label: RUN_STATUS_LABEL[status as keyof typeof RUN_STATUS_LABEL],
      value: count,
      color: RUN_STATUS_CHART_COLOR[status as keyof typeof RUN_STATUS_CHART_COLOR],
    })) ?? RUN_STATUS_ORDER.map((status) => ({ label: RUN_STATUS_LABEL[status], value: 0, color: RUN_STATUS_CHART_COLOR[status] }))
  ), [data]);

  const lineItemSegments: DonutSegment[] = useMemo(() => [
    { label: LINE_ITEM_STATUS_LABEL.REVIEWED, value: data?.lineItemOutcome.reviewed ?? 0, color: LINE_ITEM_STATUS_CHART_COLOR.REVIEWED },
    { label: LINE_ITEM_STATUS_LABEL.IN_REVIEW, value: data?.lineItemOutcome.inReview ?? 0, color: LINE_ITEM_STATUS_CHART_COLOR.IN_REVIEW },
  ], [data]);

  const trendData = useMemo(
    () => data ? selectDashboardTrend(data, trendMonth) : { monthlyRuns: [], dailyRuns: [] },
    [data, trendMonth],
  );

  const monthOptions = data?.monthlyRuns.map((point) => ({
    value: point.month,
    label: new Date(`${point.month}-01T00:00:00.000Z`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
  })) ?? [];

  if (loading && !data) return <LoadingState label="Loading dashboard..." fullHeight />;
  if (error || !data) return <ErrorState message={error ?? 'Unable to load dashboard.'} onRetry={() => setRefreshToken((token) => token + 1)} />;

  return (
    <div className="dashboard-page pb-7">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of GL tax classification activity."
        className="dashboard-page-header"
        actions={
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-text-muted" aria-hidden="true" />
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates ?? [null, null]);
                setTrendMonth(undefined);
              }}
              format="D MMM YYYY"
              allowClear
              placeholder={['Start Date', 'End Date']}
              className="h-9 w-[270px]"
            />
            <Button
              icon={<RefreshCw size={14} />}
              loading={loading}
              onClick={() => setRefreshToken((token) => token + 1)}
              aria-label="Refresh dashboard"
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mb-2 flex items-center">
        <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">Overview</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <SummaryCard label="Total Runs" value={data.summary.totalRuns} icon={FileStack} />
        <SummaryCard label="Total Line Items" value={data.summary.totalLineItems} icon={ListChecks} />
        <SummaryCard label="In Review" value={data.summary.inReview} icon={Clock} tone="warning" />
        <SummaryCard label="Finalized Runs" value={data.summary.finalizedRuns} icon={CheckCircle2} tone="success" />
        <SummaryCard label="Failed Runs" value={data.summary.failedRuns} icon={XCircle} tone="error" />
      </div>

      <div className="mb-2 flex items-center">
        <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">Status Analysis</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <SectionCard title="Run Status Breakdown" icon={Activity}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 min-h-[205px]">
            <DonutChart segments={runStatusSegments} centerValue={data.summary.totalRuns} centerLabel="Total Runs" />
            <DonutLegend segments={runStatusSegments} total={data.summary.totalRuns} />
          </div>
        </SectionCard>

        <SectionCard title="Line Items by Outcome" icon={ListChecks}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 min-h-[205px]">
            <DonutChart segments={lineItemSegments} centerValue={data.summary.totalLineItems} centerLabel="Line Items" />
            <DonutLegend segments={lineItemSegments} total={data.summary.totalLineItems} />
          </div>
        </SectionCard>
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.03em] text-text-muted">Classification Trends</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-text-muted">Month</span>
          <Select
            allowClear
            value={trendMonth}
            placeholder="All months"
            options={monthOptions}
            onChange={setTrendMonth}
            className="w-[140px]"
            size="small"
          />
          <Button size="small" onClick={() => setTrendMonth(undefined)}>Clear</Button>
          <Button size="small" icon={<RefreshCw size={13} />} loading={loading} onClick={() => setRefreshToken((token) => token + 1)} aria-label="Refresh trend charts" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <SectionCard title="Classification Runs - Monthly" icon={BarChart3} className="h-full">
          <MonthlyRunsChart data={trendData.monthlyRuns} />
        </SectionCard>
        <SectionCard title="Daily Classification Runs" icon={TrendingUp} className="h-full">
          <DailyRunsChart data={trendData.dailyRuns} />
        </SectionCard>
      </div>
    </div>
  );
}
