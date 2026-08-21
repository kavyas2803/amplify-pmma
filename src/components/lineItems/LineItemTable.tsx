import type { ColumnsType } from 'antd/es/table';
import { DataTable } from '@/components/common/DataTable';
import { TruncatedText } from '@/components/common/TruncatedText';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LineItemActions } from '@/components/lineItems/LineItemActions';
import { TAX_CLASSIFICATION_SHORT_LABEL, getConfidenceBand } from '@/constants/classifications';
import { LINE_ITEM_STATUS_LABEL, LINE_ITEM_STATUS_TONE } from '@/constants/statuses';
import { formatCurrency, formatDateTime, formatPercent } from '@/utils/formatting';
import { messages } from '@/constants/messages';
import type { LineItem } from '@/types/lineItem';

const CONFIDENCE_TONE_CLASS: Record<'HIGH' | 'MEDIUM' | 'LOW', string> = {
  HIGH: 'text-success-text',
  MEDIUM: 'text-warning-text',
  LOW: 'text-error-text',
};

interface LineItemTableProps {
  items: LineItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (item: LineItem) => void;
  onViewHistory: (item: LineItem) => void;
}

export function LineItemTable({
  items,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onViewHistory,
}: LineItemTableProps) {
  const columns: ColumnsType<LineItem> = [
    {
      title: 'Delivery Number',
      dataIndex: 'deliveryNumber',
      key: 'deliveryNumber',
      width: 130,
    },
    {
      title: 'Profit Center',
      dataIndex: 'profitCenter',
      key: 'profitCenter',
      width: 130,
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      width: 240,
      render: (value: string) => <TruncatedText value={value} />,
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      key: 'vendorName',
      width: 200,
      render: (value: string) => <TruncatedText value={value} />,
    },
    {
      title: 'Amount (Local Ccy)',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (value: number, item) => (
        <span className="tabular-nums">{formatCurrency(value, item.currency)}</span>
      ),
    },
    {
      title: 'AI Suggested Classification',
      dataIndex: 'aiSuggestedClassification',
      key: 'aiSuggestedClassification',
      width: 200,
      render: (value: LineItem['aiSuggestedClassification']) => (
        <span className="text-text-muted">{TAX_CLASSIFICATION_SHORT_LABEL[value]}</span>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 110,
      align: 'right',
      render: (value: number) => (
        <span className={`font-medium tabular-nums ${CONFIDENCE_TONE_CLASS[getConfidenceBand(value)]}`}>
          {formatPercent(value)}
        </span>
      ),
    },
    {
      title: 'LLM Reasoning / Output',
      dataIndex: 'llmReasoning',
      key: 'llmReasoning',
      width: 220,
      render: (value: string) => <TruncatedText value={value} className="text-text-muted" />,
    },
    {
      title: 'Tax Classification',
      dataIndex: 'taxClassification',
      key: 'taxClassification',
      width: 180,
      render: (value: LineItem['taxClassification']) => (
        <span className="font-medium">{TAX_CLASSIFICATION_SHORT_LABEL[value]}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (value: LineItem['status']) => (
        <StatusBadge label={LINE_ITEM_STATUS_LABEL[value]} tone={LINE_ITEM_STATUS_TONE[value]} />
      ),
    },
    {
      title: 'Created Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) => <span className="text-text-muted whitespace-nowrap">{formatDateTime(value)}</span>,
    },
    {
      title: 'Updated Time',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (value: string) => <span className="text-text-muted whitespace-nowrap">{formatDateTime(value)}</span>,
    },
    {
      title: 'Updated By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 140,
      render: (value: string) => <TruncatedText value={value} className="text-text-muted" />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: 120,
      render: (_, item) => (
        <LineItemActions onEdit={() => onEdit(item)} onViewHistory={() => onViewHistory(item)} />
      ),
    },
  ];

  return (
    <DataTable<LineItem>
      columns={columns}
      data={items}
      rowKey="id"
      loading={loading}
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      emptyMessage={messages.empty.noLineItems}
      scrollX={2390}
      className="gltc-results-table"
    />
  );
}
