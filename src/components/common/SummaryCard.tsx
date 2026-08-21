import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'error';
}

const TONE_ICON_CLASSES: Record<NonNullable<SummaryCardProps['tone']>, string> = {
  default: 'bg-primary-soft text-primary',
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  error: 'bg-error-bg text-error-text',
};

export function SummaryCard({ label, value, icon: Icon, tone = 'default' }: SummaryCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 min-w-0 min-h-[112px]">
      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${TONE_ICON_CLASSES[tone]}`}>
        <Icon size={17} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-[28px] leading-none font-semibold text-text truncate">{value}</div>
        <div className="text-xs font-semibold uppercase tracking-[0.03em] text-text-muted mt-2 truncate">{label}</div>
      </div>
    </div>
  );
}
