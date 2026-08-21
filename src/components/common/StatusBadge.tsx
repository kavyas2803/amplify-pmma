import type { BadgeTone } from '@/constants/statuses';
import { AlertCircle, CheckCircle2, Circle, Info, XCircle } from 'lucide-react';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  error: 'bg-error-bg text-error-text',
  info: 'bg-info-bg text-info-text',
  neutral: 'bg-neutral-bg text-neutral-text',
};

const TONE_ICON = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  neutral: Circle,
} satisfies Record<BadgeTone, typeof Circle>;

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const Icon = TONE_ICON[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] leading-4 font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      <Icon size={13} strokeWidth={2.25} aria-hidden="true" />
      {label}
    </span>
  );
}
