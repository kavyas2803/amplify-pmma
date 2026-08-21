export interface DashboardSummary {
  totalRuns: number;
  totalLineItems: number;
  inReview: number;
  finalizedRuns: number;
  failedRuns: number;
}

export interface DashboardDateRange {
  startDate?: string;
  endDate?: string;
}

export interface DashboardStatusPoint {
  status: string;
  count: number;
}

export interface DashboardMonthPoint {
  month: string;
  count: number;
}

export interface DashboardDayPoint {
  date: string;
  count: number;
  cumulative: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  runStatusBreakdown: DashboardStatusPoint[];
  lineItemOutcome: { reviewed: number; inReview: number };
  monthlyRuns: DashboardMonthPoint[];
  dailyRuns: DashboardDayPoint[];
}

export interface DashboardTrendData {
  monthlyRuns: DashboardMonthPoint[];
  dailyRuns: DashboardDayPoint[];
}
