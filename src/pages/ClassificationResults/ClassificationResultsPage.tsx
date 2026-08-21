import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, message as antdMessage } from 'antd';
import { ArrowLeft, Download, ExternalLink, FileDown, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { LineItemFilters } from '@/components/lineItems/LineItemFilters';
import { LineItemTable } from '@/components/lineItems/LineItemTable';
import { EditLineItemModal } from '@/components/lineItems/EditLineItemModal';
import { RowHistoryModal } from '@/components/lineItems/RowHistoryModal';
import { SourceFilePreviewModal } from '@/components/lineItems/SourceFilePreviewModal';
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
  const [previewFile, setPreviewFile] = useState<string | null>(null);
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

      <section className="bg-surface border border-border rounded-lg p-4 mb-4 flex items-center gap-6 flex-wrap lg:flex-nowrap">
        <div className="min-w-[220px] flex-1">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2">Source File</div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {[run.glFileName, run.provisionFileName].map((fileName) => (
              <button
                key={fileName}
                type="button"
                onClick={() => setPreviewFile(fileName)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                <FileSpreadsheet size={15} aria-hidden="true" />
                <span>{fileName}</span>
                <ExternalLink size={13} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 border-l border-border pl-6">
          <div>
            <div className="text-xl leading-none font-semibold text-text tabular-nums">{run.totalLineItems}</div>
            <div className="text-xs text-text-muted mt-1">Line Items</div>
          </div>
          <div>
            <div className="text-xl leading-none font-semibold text-success-text tabular-nums">{run.reviewedLineItems}</div>
            <div className="text-xs text-text-muted mt-1">Reviewed</div>
          </div>
          <div>
            <div className="text-xl leading-none font-semibold text-warning-text tabular-nums">{Math.max(remaining, 0)}</div>
            <div className="text-xs text-text-muted mt-1">In Review</div>
          </div>
        </div>

        {run.totalLineItems > 0 && (
          <div className="lg:ml-auto">
            {run.status === 'FINALIZED' ? (
              <Button icon={<Download size={15} />} onClick={handleDownloadKpmg}>
                {labels.actions.downloadKpmg}
              </Button>
            ) : (
              <Button type="primary" icon={<FileDown size={15} />} disabled={!reviewComplete} loading={finalizing} onClick={handleFinalize}>
                {labels.actions.finalize}
              </Button>
            )}
          </div>
        )}
      </section>

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
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
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
      <SourceFilePreviewModal
        open={previewFile !== null}
        fileName={previewFile}
        runId={run.id}
        items={items}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
