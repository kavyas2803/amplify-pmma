import { axiosClient } from '@/services/api/axiosClient';
import type { ClassificationRun, CreateRunPayload, RunListParams, RunListResult } from '@/types/run';
import type {
  LineItem,
  LineItemListParams,
  LineItemListResult,
  RerunLineItemResult,
  UpdateLineItemPayload,
} from '@/types/lineItem';
import type { HistoryEvent } from '@/types/history';

export async function createClassificationRun(payload: CreateRunPayload): Promise<ClassificationRun> {
  const form = new FormData();
  form.append('runId', payload.runId);
  form.append('glFile', payload.glFile);
  form.append('provisionFile', payload.provisionFile);
  const response = await axiosClient.post<ClassificationRun>('/runs', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getRuns(params: RunListParams): Promise<RunListResult> {
  const response = await axiosClient.get<RunListResult>('/runs', { params });
  return response.data;
}

export async function getRunStatus(runId: string): Promise<ClassificationRun> {
  const response = await axiosClient.get<ClassificationRun>(`/runs/${runId}`);
  return response.data;
}

export async function getRunLineItems(params: LineItemListParams): Promise<LineItemListResult> {
  const { runId, ...rest } = params;
  const response = await axiosClient.get<LineItemListResult>(`/runs/${runId}/line-items`, {
    params: rest,
  });
  return response.data;
}

export async function updateLineItem(
  lineItemId: string,
  payload: UpdateLineItemPayload,
): Promise<LineItem> {
  const response = await axiosClient.put<LineItem>(`/line-items/${lineItemId}`, payload);
  return response.data;
}

export async function rerunLineItem(lineItemId: string): Promise<RerunLineItemResult> {
  const response = await axiosClient.post<RerunLineItemResult>(`/line-items/${lineItemId}/rerun`);
  return response.data;
}

export async function getLineItemHistory(lineItemId: string): Promise<HistoryEvent[]> {
  const response = await axiosClient.get<HistoryEvent[]>(`/line-items/${lineItemId}/history`);
  return response.data;
}

export async function finalizeRun(runId: string): Promise<ClassificationRun> {
  const response = await axiosClient.post<ClassificationRun>(`/runs/${runId}/finalize`);
  return response.data;
}
