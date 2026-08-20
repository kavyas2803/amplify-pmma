export type HistoryEventType =
  | 'INITIAL_CLASSIFICATION'
  | 'MANUAL_EDIT'
  | 'CLASSIFICATION_RERUN'
  | 'AI_RESULT_UPDATED'
  | 'MANUAL_TAX_CLASSIFICATION'
  | 'REVIEW_STATUS_UPDATED';

export interface HistoryEvent {
  id: string;
  lineItemId: string;
  type: HistoryEventType;
  actor: string; // "System" or a user name
  timestamp: string; // ISO
  detail?: string;
  fromValue?: string;
  toValue?: string;
  confidence?: number;
}
