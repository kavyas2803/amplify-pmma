import { useState } from 'react';
import { Button } from 'antd';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { RunHistoryFilters } from '@/components/classification/RunHistoryFilters';
import { RunHistoryTable } from '@/components/classification/RunHistoryTable';
import { NewUploadModal } from '@/components/classification/NewUploadModal';
import { ErrorState } from '@/components/common/ErrorState';
import { useRuns } from '@/hooks/useRuns';
import { useRunPolling } from '@/hooks/useRunPolling';
import { labels } from '@/constants/labels';
import type { RunStatus } from '@/types/run';

export function ClassificationPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { runs, total, loading, error, refetch } = useRuns({
    search: search || undefined,
    status: (status as RunStatus | 'ALL') ?? 'ALL',
    page,
    pageSize,
  });

  const hasProcessingRun = runs.some((r) => r.status === 'PROCESSING');
  useRunPolling(hasProcessingRun, () => refetch({ silent: true }));

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  return (
    <div>
      <PageHeader
        title="Classification"
      />

      <div className="flex items-center justify-between gap-3 mb-4">
        <SearchBar
          placeholder="Search runs..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          className="w-[320px] h-10"
        />
        <div className="flex items-center gap-2 shrink-0">
          <RunHistoryFilters
            status={status}
            onChange={(_key, value) => { setStatus(value); setPage(1); }}
            onClear={() => { setStatus('ALL'); setPage(1); }}
          />
          <Button type="primary" size="large" icon={<Plus size={16} />} onClick={() => setUploadModalOpen(true)}>
            {labels.actions.newUpload}
          </Button>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-text mb-3">Recent Runs</h2>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="bg-surface border border-border rounded-xl p-2">
          <RunHistoryTable
            runs={runs}
            total={total}
            loading={loading}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <NewUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onCreated={() => {
          setPage(1);
          refetch();
        }}
      />
    </div>
  );
}