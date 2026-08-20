import { Tooltip } from 'antd';
import type { LucideIcon } from 'lucide-react';

interface IconActionProps {
  icon: LucideIcon;
  tooltip: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function IconAction({ icon: Icon, tooltip, onClick, danger, disabled }: IconActionProps) {
  return (
    <Tooltip title={tooltip}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={tooltip}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border border-transparent transition-colors
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-page-background hover:border-border cursor-pointer'}
          ${danger ? 'text-error-text' : 'text-text-muted'}
        `}
      >
        <Icon size={16} />
      </button>
    </Tooltip>
  );
}
