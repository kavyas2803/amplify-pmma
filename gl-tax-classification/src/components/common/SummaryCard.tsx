import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'error';
}

const TONE_ICON_CLASSES: Record<NonNullable<SummaryCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  error: 'bg-error-bg text-error-text',
};

export function SummaryCard({ label, value, icon: Icon, tone = 'default' }: SummaryCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TONE_ICON_CLASSES[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold text-text leading-tight">{value}</div>
        <div className="text-xs text-text-muted truncate">{label}</div>
      </div>
    </div>
  );
}
