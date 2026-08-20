import { Input } from 'antd';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchBar({ placeholder, value, onChange, className }: SearchBarProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      prefix={<Search size={16} className="text-text-subtle" />}
      allowClear
      className={className}
      style={{ maxWidth: 320 }}
    />
  );
}
