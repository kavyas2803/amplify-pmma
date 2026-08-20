import { env } from '@/config/environment';
import { getMockDashboardSummary } from '@/mock-data/dashboard';
import { axiosClient } from '@/services/api/axiosClient';
import type { DashboardSummary } from '@/types/dashboard';

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
