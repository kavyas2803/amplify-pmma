import type { HistoryEventType } from '@/types/history';

export const HISTORY_EVENT_LABEL: Record<HistoryEventType, string> = {
  INITIAL_CLASSIFICATION: 'Initial Classification',
  MANUAL_EDIT: 'Manual Edit',
  CLASSIFICATION_RERUN: 'Classification Re-run',
  AI_RESULT_UPDATED: 'AI Result Updated',
  MANUAL_TAX_CLASSIFICATION: 'Manual Tax Classification',
  REVIEW_STATUS_UPDATED: 'Review Status Updated',
};
