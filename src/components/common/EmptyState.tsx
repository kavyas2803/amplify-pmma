import { Empty } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="py-16 flex items-center justify-center">
      <Empty description={<span className="text-text-muted">{message}</span>}>
        {action}
      </Empty>
    </div>
  );
}
