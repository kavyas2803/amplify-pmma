import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

export function SectionCard({ title, action, icon: Icon, className, children }: SectionCardProps) {
  return (
    <div className={`bg-surface border border-border rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${className ?? ''}`}>
      <div className="px-4 py-3.5 border-b border-border flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[14px] leading-5 font-semibold text-text m-0">
          {Icon && <Icon size={13} className="text-primary" />}
          {title}
        </h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
