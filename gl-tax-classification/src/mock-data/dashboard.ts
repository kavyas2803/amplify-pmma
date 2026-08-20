import { mockStore } from '@/mock-data/store';
import type { DashboardSummary } from '@/types/dashboard';

export function getMockDashboardSummary(): DashboardSummary {
  const runs = mockStore.runs;
  const totalLineItems = runs.reduce((sum, r) => sum + r.totalLineItems, 0);
  const inReview = runs.filter((r) => r.status === 'IN_REVIEW' || r.status === 'READY_FOR_REVIEW').length;
  const finalizedRuns = runs.filter((r) => r.status === 'FINALIZED').length;
  const failedRuns = runs.filter((r) => r.status === 'FAILED').length;

  return {
    totalRuns: runs.length,
    totalLineItems,
    inReview,
    finalizedRuns,
    failedRuns,
  };
}
