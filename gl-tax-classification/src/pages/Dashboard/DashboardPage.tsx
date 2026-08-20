import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileStack, ListChecks, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SummaryCard } from '@/components/common/SummaryCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { IconAction } from '@/components/common/IconAction';
import { getDashboardSummary } from '@/services/repositories/dashboardRepository';
import { getRuns } from '@/services/repositories/classificationRepository';
import { RUN_STATUS_LABEL, RUN_STATUS_TONE } from '@/constants/statuses';
import { formatDateTime } from '@/utils/formatting';
import type { DashboardSummary } from '@/types/dashboard';
import type { ClassificationRun } from '@/types/run';

export function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentRuns, setRecentRuns] = useState<ClassificationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getDashboardSummary(), getRuns({ page: 1, pageSize: 5 })])
      .then(([summaryResult, runsResult]) => {
        if (cancelled) return;
        setSummary(summaryResult);
        setRecentRuns(runsResult.runs);
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
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." fullHeight />;
  if (error || !summary) return <ErrorState message={error ?? 'Unable to load dashboard.'} />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of GL tax classification activity." />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        <SummaryCard label="Total Runs" value={summary.totalRuns} icon={FileStack} />
        <SummaryCard label="Total Line Items" value={summary.totalLineItems} icon={ListChecks} />
        <SummaryCard label="In Review" value={summary.inReview} icon={Clock} tone="warning" />
        <SummaryCard label="Finalized Runs" value={summary.finalizedRuns} icon={CheckCircle2} tone="success" />
        <SummaryCard label="Failed Runs" value={summary.failedRuns} icon={XCircle} tone="error" />
      </div>

      <div className="bg-surface border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text m-0">Recent Activity</h2>
          <button
            type="button"
            onClick={() => navigate('/classification')}
            className="text-xs text-primary font-medium hover:underline cursor-pointer bg-transparent border-none"
          >
            View all runs
          </button>
        </div>
        <div className="divide-y divide-border">
          {recentRuns.map((run) => (
            <div key={run.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-text font-medium truncate">{run.glFileName}</div>
                <div className="text-xs text-text-muted mt-0.5">
                  {formatDateTime(run.updatedAt)} · {run.createdBy}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge label={RUN_STATUS_LABEL[run.status]} tone={RUN_STATUS_TONE[run.status]} />
                <IconAction icon={Eye} tooltip="View" onClick={() => navigate(`/classification/${run.id}`)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
