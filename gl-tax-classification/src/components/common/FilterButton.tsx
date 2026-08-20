import { useState } from 'react';
import { Badge, Button, Popover, Select, Space, Typography } from 'antd';
import { SlidersHorizontal } from 'lucide-react';

export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  options: FilterFieldOption[];
}

interface FilterButtonProps {
  fields: FilterFieldConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function FilterButton({ fields, values, onChange, onClear }: FilterButtonProps) {
  const [open, setOpen] = useState(false);

  const activeCount = fields.filter((f) => values[f.key] && values[f.key] !== 'ALL').length;

  const content = (
    <div className="w-64">
      <Space direction="vertical" size="middle" className="w-full">
        {fields.map((field) => (
          <div key={field.key}>
            <Typography.Text className="text-xs text-text-muted block mb-1">
              {field.label}
            </Typography.Text>
            <Select
              className="w-full"
              value={values[field.key] ?? 'ALL'}
              onChange={(v) => onChange(field.key, v)}
              options={field.options}
            />
          </div>
        ))}
        <Button block onClick={onClear} disabled={activeCount === 0}>
          Clear Filters
        </Button>
      </Space>
    </div>
  );

  return (
    <Popover
      content={content}
      title="Filters"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={activeCount} size="small" offset={[-4, 4]}>
        <Button icon={<SlidersHorizontal size={14} />}>Filters</Button>
      </Badge>
    </Popover>
  );
}
