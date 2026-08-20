import type { RunStatus } from '@/types/run';
import type { LineItemStatus } from '@/types/lineItem';

export const RUN_STATUS: Record<RunStatus, RunStatus> = {
  PROCESSING: 'PROCESSING',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  IN_REVIEW: 'IN_REVIEW',
  FINALIZED: 'FINALIZED',
  FAILED: 'FAILED',
};

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  PROCESSING: 'Processing',
  READY_FOR_REVIEW: 'Ready for Review',
  IN_REVIEW: 'In Review',
  FINALIZED: 'Finalized',
  FAILED: 'Failed',
};

// Maps a status to a semantic badge tone consumed by <StatusBadge />
export type BadgeTone = 'success' | 'warning' | 'error' | 'neutral' | 'info';

export const RUN_STATUS_TONE: Record<RunStatus, BadgeTone> = {
  PROCESSING: 'neutral',
  READY_FOR_REVIEW: 'info',
  IN_REVIEW: 'warning',
  FINALIZED: 'success',
  FAILED: 'error',
};

export const LINE_ITEM_STATUS: Record<LineItemStatus, LineItemStatus> = {
  IN_REVIEW: 'IN_REVIEW',
  REVIEWED: 'REVIEWED',
};

export const LINE_ITEM_STATUS_LABEL: Record<LineItemStatus, string> = {
  IN_REVIEW: 'In Review',
  REVIEWED: 'Reviewed',
};

export const LINE_ITEM_STATUS_TONE: Record<LineItemStatus, BadgeTone> = {
  IN_REVIEW: 'warning',
  REVIEWED: 'success',
};

export const LINE_ITEM_STATUS_OPTIONS = [
  { value: 'IN_REVIEW', label: LINE_ITEM_STATUS_LABEL.IN_REVIEW },
  { value: 'REVIEWED', label: LINE_ITEM_STATUS_LABEL.REVIEWED },
];
