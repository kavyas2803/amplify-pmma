import { FilterButton } from '@/components/common/FilterButton';
import { TAX_CLASSIFICATION_OPTIONS, CONFIDENCE_BAND_OPTIONS } from '@/constants/classifications';
import { LINE_ITEM_STATUS_LABEL } from '@/constants/statuses';

interface LineItemFiltersProps {
  values: {
    taxClassification: string;
    status: string;
    confidenceBand: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

const TAX_OPTIONS = [{ value: 'ALL', label: 'All Classifications' }, ...TAX_CLASSIFICATION_OPTIONS];
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...Object.entries(LINE_ITEM_STATUS_LABEL).map(([value, label]) => ({ value, label })),
];

export function LineItemFilters({ values, onChange, onClear }: LineItemFiltersProps) {
  return (
    <FilterButton
      fields={[
        { key: 'taxClassification', label: 'Tax Classification', options: TAX_OPTIONS },
        { key: 'status', label: 'Status', options: STATUS_OPTIONS },
        { key: 'confidenceBand', label: 'Confidence', options: CONFIDENCE_BAND_OPTIONS as { value: string; label: string }[] },
      ]}
      values={values}
      onChange={onChange}
      onClear={onClear}
    />
  );
}
