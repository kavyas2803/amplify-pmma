import dayjs from 'dayjs';

export function formatDateTime(iso: string): string {
  return dayjs(iso).format('DD MMM YYYY, hh:mm A');
}

export function formatDate(iso: string): string {
  return dayjs(iso).format('DD MMM YYYY');
}

export function formatCurrency(amount: number, currency = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
