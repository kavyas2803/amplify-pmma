export type RunStatus =
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'IN_REVIEW'
  | 'FINALIZED'
  | 'FAILED';

export interface ClassificationRun {
  id: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  glFileName: string;
  provisionFileName: string;
  totalLineItems: number;
  reviewedLineItems: number;
  status: RunStatus;
  createdBy: string;
  failureReason?: string;
  kpmgExcelAvailable: boolean;
}

export interface CreateRunPayload {
  runId: string;
  glFile: File;
  provisionFile: File;
}

export interface RunListParams {
  search?: string;
  status?: RunStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface RunListResult {
  runs: ClassificationRun[];
  total: number;
}
