export const DEFAULT_TRUNCATE_LENGTH = 30;

export function truncateText(value: string, maxLength: number = DEFAULT_TRUNCATE_LENGTH): string {
  if (!value) return value;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

export function isTruncated(value: string, maxLength: number = DEFAULT_TRUNCATE_LENGTH): boolean {
  return Boolean(value) && value.length > maxLength;
}
