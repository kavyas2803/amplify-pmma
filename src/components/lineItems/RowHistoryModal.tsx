import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { CheckCircle2, Circle, FileEdit, RefreshCw, ShieldCheck, X } from 'lucide-react';
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
      return `Classification changed from ${labelForValue(event.fromValue)} → ${labelForValue(event.toValue)}`;
    case 'REVIEW_STATUS_UPDATED':
      return `Status changed from ${event.fromValue} → ${event.toValue}`;
    case 'MANUAL_EDIT':
      return event.detail ?? 'Line item details updated.';
    case 'CLASSIFICATION_RERUN':
      return 'Requested a new AI classification for this line item.';
    default:
      return event.detail ?? '';
  }
}

function eventIcon(type: HistoryEvent['type']) {
  if (type === 'INITIAL_CLASSIFICATION') return <Circle size={15} />;
  if (type === 'REVIEW_STATUS_UPDATED') return <CheckCircle2 size={15} />;
  if (type === 'CLASSIFICATION_RERUN') return <RefreshCw size={15} />;
  if (type === 'MANUAL_EDIT' || type === 'MANUAL_TAX_CLASSIFICATION') return <FileEdit size={15} />;
  return <ShieldCheck size={15} />;
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
    <Modal
      open={open}
      onCancel={onClose}
      closeIcon={<X size={18} />}
      title={<div><div className="text-base font-semibold">Classification Logs</div><div className="text-xs font-normal text-text-muted mt-1">Selected line item audit history</div></div>}
      footer={<div className="flex justify-end"><button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-page-background cursor-pointer">Close</button></div>}
      width="min(90vw, 860px)"
      styles={{ body: { padding: 0 } }}
      destroyOnHidden
    >
      {item && (
        <div className="border-y border-border bg-surface-muted px-5 py-3 text-xs text-text-muted">
          Delivery Number: <span className="font-semibold text-text">{item.deliveryNumber}</span>
          <span className="mx-2 text-text-subtle">•</span>
          Profit Center: <span className="font-semibold text-text">{item.profitCenter}</span>
        </div>
      )}

      {loading && <LoadingState label="Loading history..." />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && events.length === 0 && <EmptyState message={messages.empty.noHistory} />}

      {!loading && !error && events.length > 0 && (
        <div className="overflow-x-auto gltc-scroll-thin">
          <table className="min-w-[680px] w-full border-collapse text-[13px]">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="w-[150px] border-b border-border px-5 py-3 text-left text-xs font-semibold text-text-muted">Time</th>
                <th className="w-[190px] border-b border-border px-4 py-3 text-left text-xs font-semibold text-text-muted">Event</th>
                <th className="w-[130px] border-b border-border px-4 py-3 text-left text-xs font-semibold text-text-muted">User</th>
                <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold text-text-muted">Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="align-top hover:bg-page-background">
                  <td className="border-b border-border px-5 py-3 text-xs leading-5 text-text-muted whitespace-nowrap">{formatDateTime(event.timestamp)}</td>
                  <td className="border-b border-border px-4 py-3"><span className="inline-flex items-center gap-2 font-medium text-text">{eventIcon(event.type)}{HISTORY_EVENT_LABEL[event.type]}</span></td>
                  <td className="border-b border-border px-4 py-3 text-text-muted">{event.actor}</td>
                  <td className="border-b border-border px-4 py-3 text-text">{eventDescription(event)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
