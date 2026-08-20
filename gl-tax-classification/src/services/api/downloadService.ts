import { axiosClient } from '@/services/api/axiosClient';

interface DownloadUrlResponse {
  url: string;
}

async function openDownloadUrl(endpoint: string): Promise<void> {
  const response = await axiosClient.get<DownloadUrlResponse>(endpoint);
  window.open(response.data.url, '_blank');
}

export async function downloadSourceFiles(runId: string, _glFileName?: string): Promise<void> {
  return openDownloadUrl(`/runs/${runId}/source-files/download-url`);
}

export async function downloadKpmgExcel(runId: string): Promise<void> {
  return openDownloadUrl(`/runs/${runId}/kpmg-excel/download-url`);
}
