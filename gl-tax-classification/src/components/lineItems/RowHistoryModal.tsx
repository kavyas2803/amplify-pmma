import { useEffect, useState } from 'react';
import { Modal, Timeline } from 'antd';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { getLineItemHistory } from '@/services/repositories/classificationRepository';
import { HISTORY_EVENT_LABEL } from '@/constants/historyEvents';
import { TAX_CLASSIFICATION_SHORT_LABEL } from '@/constants/classifications';
import { formatDateTime, formatPercent } from '@/utils/formatting';
import { messages } from '@/constants/messages';
import type { HistoryEvent } from '@/types/history';
import type { LineItem, TaxClassificationCode } from '@/types/lineItem';

interface RowHistoryModalProps {
  open: boolean;
  item: LineItem | null;
  onClose: () => void;
}

function labelForValue(value?: string): string {
  if (!value) return '';
  if (value in TAX_CLASSIFICATION_SHORT_LABEL) {
    return TAX_CLASSIFICATION_SHORT_LABEL[value as TaxClassificationCode];
  }
  return value;
}

function eventDescription(event: HistoryEvent): string {
  switch (event.type) {
    case 'INITIAL_CLASSIFICATION':
      return `${labelForValue(event.toValue)}${event.confidence !== undefined ? ` · Confidence: ${formatPercent(event.confidence)}` : ''}`;
    case 'AI_RESULT_UPDATED':
      return `${labelForValue(event.toValue)}${event.confidence !== undefined ? ` · Confidence: ${formatPercent(event.confidence)}` : ''}`;
    case 'MANUAL_TAX_CLASSIFICATION':
      return `${labelForValue(event.fromValue)} → ${labelForValue(event.toValue)}`;
    case 'REVIEW_STATUS_UPDATED':
      return `${event.fromValue} → ${event.toValue}`;
    case 'MANUAL_EDIT':
      return event.detail ?? 'Line item details updated.';
    case 'CLASSIFICATION_RERUN':
      return 'Requested a new AI classification for this line item.';
    default:
      return event.detail ?? '';
  }
}

export function RowHistoryModal({ open, item, onClose }: RowHistoryModalProps) {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLineItemHistory(item.id)
      .then((result) => {
        if (!cancelled) setEvents(result);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load history. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, item]);

  return (
    <Modal title="Line Item History" open={open} onCancel={onClose} footer={null} width={560} destroyOnHidden>
      {item && (
        <div className="text-sm text-text-muted mb-4">
          Delivery Number: <span className="text-text font-medium">{item.deliveryNumber}</span>
        </div>
      )}

      {loading && <LoadingState label="Loading history..." />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && events.length === 0 && <EmptyState message={messages.empty.noHistory} />}

      {!loading && !error && events.length > 0 && (
        <Timeline
          items={events.map((event) => ({
            children: (
              <div className="pb-1">
                <div className="text-xs text-text-subtle mb-0.5">{formatDateTime(event.timestamp)}</div>
                <div className="text-sm font-medium text-text">{HISTORY_EVENT_LABEL[event.type]}</div>
                <div className="text-xs text-text-muted mb-1">{event.actor}</div>
                <div className="text-sm text-text">{eventDescription(event)}</div>
              </div>
            ),
          }))}
        />
      )}
    </Modal>
  );
}
