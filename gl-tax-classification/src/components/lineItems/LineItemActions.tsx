import { Pencil, History } from 'lucide-react';
import { IconAction } from '@/components/common/IconAction';
import { labels } from '@/constants/labels';

interface LineItemActionsProps {
  onEdit: () => void;
  onViewHistory: () => void;
}

export function LineItemActions({ onEdit, onViewHistory }: LineItemActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <IconAction icon={Pencil} tooltip={labels.actions.edit} onClick={onEdit} />
      <IconAction icon={History} tooltip={labels.actions.viewHistory} onClick={onViewHistory} />
    </div>
  );
}
