import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backAction?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, backAction, className }: PageHeaderProps) {
  return (
    <div className={`mb-4 ${className ?? ''}`}>
      {backAction && <div className="mb-2">{backAction}</div>}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] leading-[1.2] font-semibold text-text m-0">{title}</h1>
          {subtitle && <p className="text-[13px] leading-5 text-text-muted mt-1 mb-0">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
