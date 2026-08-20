import { FilterButton } from '@/components/common/FilterButton';
import { RUN_STATUS_LABEL } from '@/constants/statuses';

interface RunHistoryFiltersProps {
  status: string;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...Object.entries(RUN_STATUS_LABEL).map(([value, label]) => ({ value, label })),
];

export function RunHistoryFilters({ status, onChange, onClear }: RunHistoryFiltersProps) {
  return (
    <FilterButton
      fields={[{ key: 'status', label: 'Status', options: STATUS_OPTIONS }]}
      values={{ status }}
      onChange={onChange}
      onClear={onClear}
    />
  );
}
