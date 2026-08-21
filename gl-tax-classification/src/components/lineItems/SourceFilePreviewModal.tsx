import { useState } from 'react';
import { Button, Modal } from 'antd';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { downloadSourceFiles } from '@/services/repositories/classificationRepository';
import { formatCurrency, formatDateTime } from '@/utils/formatting';
import type { LineItem } from '@/types/lineItem';

interface SourceFilePreviewModalProps {
  open: boolean;
  fileName: string | null;
  runId: string;
  items: LineItem[];
  onClose: () => void;
}

const PREVIEW_COLUMNS = [
  ['Delivery Number', (item: LineItem) => item.deliveryNumber],
  ['Profit Center', (item: LineItem) => item.profitCenter],
  ['Text', (item: LineItem) => item.text],
  ['Vendor Name', (item: LineItem) => item.vendorName],
  ['Amount', (item: LineItem) => formatCurrency(item.amount, item.currency)],
  ['Created Time', (item: LineItem) => formatDateTime(item.createdAt)],
] as const;

export function SourceFilePreviewModal({ open, fileName, runId, items, onClose }: SourceFilePreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!fileName) return;
    setDownloading(true);
    try {
      await downloadSourceFiles(runId, fileName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closeIcon={<X size={18} />}
      title={
        <div className="flex items-start gap-3 pr-6">
          <span className="mt-0.5 rounded-md bg-success-bg p-2 text-success-text"><FileSpreadsheet size={18} /></span>
          <div>
            <div className="text-base font-semibold text-text">Source File Preview</div>
            <div className="text-xs font-normal text-text-muted mt-0.5">{fileName}</div>
          </div>
        </div>
      }
      width="min(84vw, 1180px)"
      footer={<div className="flex justify-end gap-2"><Button onClick={onClose}>Close</Button><Button icon={<Download size={15} />} loading={downloading} onClick={handleDownload}>Download</Button></div>}
      styles={{ body: { padding: 0 } }}
      destroyOnHidden
    >
      <div className="border-y border-border bg-surface-muted px-4 py-2 text-xs text-text-muted">Available line-item data</div>
      <div className="max-h-[58vh] overflow-auto gltc-scroll-thin">
        <table className="min-w-[900px] w-full border-collapse text-[13px]">
          <thead className="sticky top-0 z-10 bg-[#f8fafc]">
            <tr>
              <th className="w-12 border-b border-r border-border px-3 py-3 text-right text-xs font-semibold text-text-muted">#</th>
              {PREVIEW_COLUMNS.map(([label]) => <th key={label} className="min-w-[150px] border-b border-r border-border px-4 py-3 text-left text-xs font-semibold text-text-muted">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-page-background">
                <td className="border-b border-r border-border px-3 py-3 text-right text-xs text-text-subtle">{index + 1}</td>
                {PREVIEW_COLUMNS.map(([label, getValue]) => <td key={label} title={getValue(item)} className="max-w-[280px] truncate border-b border-border px-4 py-3 text-text">{getValue(item)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}