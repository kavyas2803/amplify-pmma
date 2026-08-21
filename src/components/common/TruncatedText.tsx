import { Tooltip } from 'antd';
import { DEFAULT_TRUNCATE_LENGTH, isTruncated, truncateText } from '@/utils/truncation';

interface TruncatedTextProps {
  value: string;
  maxLength?: number;
  className?: string;
}

export function TruncatedText({ value, maxLength = DEFAULT_TRUNCATE_LENGTH, className }: TruncatedTextProps) {
  if (!value) return <span className={className}>—</span>;

  if (!isTruncated(value, maxLength)) {
    return <span className={className}>{value}</span>;
  }

  return (
    <Tooltip title={value} placement="topLeft">
      <span className={className} tabIndex={0} aria-label={value}>
        {truncateText(value, maxLength)}
      </span>
    </Tooltip>
  );
}
