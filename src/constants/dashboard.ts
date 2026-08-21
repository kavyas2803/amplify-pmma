import type { RunStatus } from '@/types/run';

export const RUN_STATUS_ORDER: RunStatus[] = [
  'PROCESSING',
  'READY_FOR_REVIEW',
  'IN_REVIEW',
  'FINALIZED',
  'FAILED',
];