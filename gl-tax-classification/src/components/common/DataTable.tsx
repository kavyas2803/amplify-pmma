import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EmptyState } from '@/components/common/EmptyState';

interface DataTableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  rowKey: string;
  loading?: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  emptyMessage: string;
  scrollY?: number | string;
  scrollX?: number | string;
  className?: string;
}

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'];

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  emptyMessage,
  scrollY = 520,
  scrollX = 1200,
  className,
}: DataTableProps<T>) {
  return (
    <div className="gltc-scroll-thin">
      <Table<T>
        className={className}
        columns={columns}
        dataSource={data}
        rowKey={rowKey}
        loading={loading}
        scroll={{ y: scrollY, x: scrollX }}
        locale={{
          emptyText: <EmptyState message={emptyMessage} />,
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showTotal: (t, range) => `${range[0]}–${range[1]} of ${t}`,
          onChange: onPageChange,
        }}
      />
    </div>
  );
}
