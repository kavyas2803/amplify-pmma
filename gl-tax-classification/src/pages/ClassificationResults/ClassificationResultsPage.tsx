import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, message as antdMessage } from 'antd';
import { ArrowLeft, CheckCircle2, FileDown } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { LineItemFilters } from '@/components/lineItems/LineItemFilters';
import { LineItemTable } from '@/components/lineItems/LineItemTable';
import { EditLineItemModal } from '@/components/lineItems/EditLineItemModal';
import { RowHistoryModal } from '@/components/lineItems/RowHistoryModal';
import { useLineItems } from '@/hooks/useLineItems';
import {
  getRunStatus,
  finalizeRun,
  downloadKpmgExcel,
} from '@/services/repositories/classificationRepository';
import { labels } from '@/constants/labels';
import { messages } from '@/constants/messages';
import type { ClassificationRun } from '@/types/run';
import type { LineItem, TaxClassificationCode, LineItemStatus } from '@/types/lineItem';

export function ClassificationResultsPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const [run, setRun] = useState<ClassificationRun | null>(null);
  const [runLoading, setRunLoading] = useState(true);
  const [runError, setRunError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [taxClassification, setTaxClassification] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [confidenceBand, setConfidenceBand] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [historyItem, setHistoryItem] = useState<LineItem | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const { items, total, loading, error, refetch } = useLineItems({
    runId: runId ?? '',
    search: search || undefined,
    taxClassification: taxClassification as TaxClassificationCode | 'ALL',
    status: status as LineItemStatus | 'ALL',
    confidenceBand: confidenceBand as 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL',
    page,
    pageSize,
  });

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    setRunLoading(true);
    setRunError(null);
    getRunStatus(runId)
      .then((result) => {
        if (!cancelled) setRun(result);
      })
      .catch(() => {
        if (!cancelled) setRunError('Unable to load run details.');
      })
      .finally(() => {
        if (!cancelled) setRunLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [runId]);

  const refreshRun = () => {
    if (!runId) return;
    getRunStatus(runId).then(setRun).catch(() => {});
  };

  const handleSaved = (updated: LineItem) => {
    refetch();
    refreshRun();
    void updated;
  };

  const handleFinalize = async () => {
    if (!runId) return;
    setFinalizing(true);
    try {
      const updated = await finalizeRun(runId);
      setRun(updated);
      antdMessage.success(messages.success.finalized);
    } catch (err) {
      antdMessage.error((err as { message?: string })?.message ?? messages.errors.finalizeFailed);
    } finally {
      setFinalizing(false);
    }
  };

  const handleDownloadKpmg = async () => {
    if (!runId) return;
    try {
      await downloadKpmgExcel(runId);
    } catch {
      antdMessage.error(messages.errors.downloadFailed);
    }
  };

  if (runLoading) return <LoadingState label="Loading run..." fullHeight />;
  if (runError || !run) return <ErrorState message={runError ?? 'Run not found.'} />;

  const remaining = run.totalLineItems - run.reviewedLineItems;
  const reviewComplete = run.totalLineItems > 0 && remaining <= 0;

  return (
    <div>
      <PageHeader
        title={labels.pages.classificationResults}
        backAction={
          <button
            type="button"
            onClick={() => navigate('/classification')}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft size={15} />
            {labels.actions.backToClassification}
          </button>
        }
      />

      <div className="bg-surface border border-border rounded-xl p-4 mb-4">
        <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Source Files</div>
        <div className="text-sm text-text">{run.glFileName}</div>
        <div className="text-sm text-text-muted">{run.provisionFileName}</div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <div>
            <div className="text-lg font-semibold text-text">{run.totalLineItems}</div>
            <div className="text-xs text-text-muted">Line Items</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-success-text">{run.reviewedLineItems}</div>
            <div className="text-xs text-text-muted">Reviewed</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning-text">{Math.max(remaining, 0)}</div>
            <div className="text-xs text-text-muted">In Review</div>
          </div>
        </div>
      </div>

      {run.totalLineItems > 0 && (
        <div
          className={`rounded-xl p-4 mb-4 flex items-center justify-between flex-wrap gap-3 border ${
            reviewComplete ? 'bg-success-bg border-success-text/30' : 'bg-surface border-border'
          }`}
        >
          <div className="flex items-center gap-2">
            {reviewComplete && <CheckCircle2 size={18} className="text-success-text" />}
            <span className={`text-sm font-medium ${reviewComplete ? 'text-success-text' : 'text-text'}`}>
              {reviewComplete
                ? `${messages.info.reviewComplete} ${run.totalLineItems} / ${run.totalLineItems} line items reviewed`
                : messages.info.reviewIncomplete(remaining)}
            </span>
          </div>
          {run.status === 'FINALIZED' ? (
            <Button icon={<FileDown size={15} />} onClick={handleDownloadKpmg}>
              {labels.actions.downloadKpmg}
            </Button>
          ) : (
            <Button type="primary" disabled={!reviewComplete} loading={finalizing} onClick={handleFinalize}>
              {labels.actions.finalize}
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <SearchBar
          placeholder="Search line items..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
        />
        <LineItemFilters
          values={{ taxClassification, status, confidenceBand }}
          onChange={(key, value) => {
            setPage(1);
            if (key === 'taxClassification') setTaxClassification(value);
            if (key === 'status') setStatus(value);
            if (key === 'confidenceBand') setConfidenceBand(value);
          }}
          onClear={() => {
            setTaxClassification('ALL');
            setStatus('ALL');
            setConfidenceBand('ALL');
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="bg-surface border border-border rounded-xl p-2">
          <LineItemTable
            items={items}
            total={total}
            loading={loading}
            page={page}
            pageSize={pageSize}
            onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
            onEdit={setEditingItem}
            onViewHistory={setHistoryItem}
          />
        </div>
      )}

      <EditLineItemModal
        open={editingItem !== null}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={handleSaved}
      />

      <RowHistoryModal open={historyItem !== null} item={historyItem} onClose={() => setHistoryItem(null)} />
    </div>
  );
}
