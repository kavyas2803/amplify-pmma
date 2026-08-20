import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backAction?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, backAction }: PageHeaderProps) {
  return (
    <div className="mb-5">
      {backAction && <div className="mb-2">{backAction}</div>}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text m-0">{title}</h1>
          {subtitle && <p className="text-sm text-text-muted mt-1 mb-0">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
