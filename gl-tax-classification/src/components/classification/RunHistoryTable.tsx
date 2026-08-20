import { useState } from 'react';
import { Popover } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Eye, Download, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TruncatedText } from '@/components/common/TruncatedText';
import { IconAction } from '@/components/common/IconAction';
import { RUN_STATUS_LABEL, RUN_STATUS_TONE } from '@/constants/statuses';
import { downloadSourceFiles, downloadKpmgExcel } from '@/services/repositories/classificationRepository';
import { formatDateTime } from '@/utils/formatting';
import { messages } from '@/constants/messages';
import type { ClassificationRun } from '@/types/run';

interface RunHistoryTableProps {
  runs: ClassificationRun[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
}

function SourceFilesDownloadCell({ run }: { run: ClassificationRun }) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (fileName: string) => {
    setDownloading(fileName);
    try {
      await downloadSourceFiles(run.id, fileName);
    } catch {
      // normalized error toast could go here
    } finally {
      setDownloading(null);
    }
  };

  const content = (
    <div className="flex flex-col gap-1 min-w-[220px]">
      <button
        type="button"
        onClick={() => handleDownload(run.glFileName)}
        className="text-left text-sm text-text hover:text-primary px-2 py-1.5 rounded hover:bg-page-background cursor-pointer bg-transparent border-none"
      >
        {downloading === run.glFileName ? 'Downloading…' : run.glFileName}
      </button>
      <button
        type="button"
        onClick={() => handleDownload(run.provisionFileName)}
        className="text-left text-sm text-text hover:text-primary px-2 py-1.5 rounded hover:bg-page-background cursor-pointer bg-transparent border-none"
      >
        {downloading === run.provisionFileName ? 'Downloading…' : run.provisionFileName}
      </button>
    </div>
  );

  return (
    <Popover content={content} title="Download Source Files" trigger="click" placement="left">
      <span>
        <IconAction icon={Download} tooltip="Download" />
      </span>
    </Popover>
  );
}

export function RunHistoryTable({ runs, total, loading, page, pageSize, onPageChange }: RunHistoryTableProps) {
  const navigate = useNavigate();
  const [downloadingKpmg, setDownloadingKpmg] = useState<string | null>(null);

  const handleDownloadKpmg = async (run: ClassificationRun) => {
    setDownloadingKpmg(run.id);
    try {
      await downloadKpmgExcel(run.id);
    } finally {
      setDownloadingKpmg(null);
    }
  };

  const columns: ColumnsType<ClassificationRun> = [
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 190,
      render: (value: string) => <span className="text-sm text-text whitespace-nowrap">{formatDateTime(value)}</span>,
    },
    {
      title: 'Source Files',
      key: 'sourceFiles',
      width: 240,
      render: (_, run) => (
        <div className="text-sm leading-snug">
          <div className="text-text whitespace-nowrap"><TruncatedText value={run.glFileName} /></div>
          <div className="text-text-muted whitespace-nowrap"><TruncatedText value={run.provisionFileName} /></div>
        </div>
      ),
    },
    {
      title: 'Line Items',
      dataIndex: 'totalLineItems',
      key: 'totalLineItems',
      width: 100,
      align: 'right',
      render: (value: number) => <span className="text-sm text-text">{value || '—'}</span>,
    },
    {
      title: 'Review Progress',
      key: 'reviewProgress',
      width: 130,
      render: (_, run) =>
        run.totalLineItems > 0 ? (
          <span className="text-sm text-text tabular-nums">
            {run.reviewedLineItems} / {run.totalLineItems}
          </span>
        ) : (
          <span className="text-sm text-text-muted">—</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (_, run) => <StatusBadge label={RUN_STATUS_LABEL[run.status]} tone={RUN_STATUS_TONE[run.status]} />,
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 140,
      render: (value: string) => <TruncatedText value={value} className="text-sm text-text" />,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 190,
      render: (value: string) => <span className="text-sm text-text-muted whitespace-nowrap">{formatDateTime(value)}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, run) => (
        <div className="flex items-center gap-1">
          <IconAction
            icon={Eye}
            tooltip="View"
            disabled={run.status === 'PROCESSING' || run.status === 'FAILED'}
            onClick={() => navigate(`/classification/${run.id}`)}
          />
          <SourceFilesDownloadCell run={run} />
          <IconAction
            icon={FileDown}
            tooltip="Download KPMG Excel"
            disabled={!run.kpmgExcelAvailable || downloadingKpmg === run.id}
            onClick={() => handleDownloadKpmg(run)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable<ClassificationRun>
      columns={columns}
      data={runs}
      rowKey="id"
      loading={loading && runs.length === 0}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      emptyMessage={messages.empty.noRuns}
      scrollX={1350}
    />
  );
}
