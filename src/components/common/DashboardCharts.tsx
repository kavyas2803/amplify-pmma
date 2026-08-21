import { useState, type ReactNode } from 'react';
import type { DashboardDayPoint, DashboardMonthPoint } from '@/types/dashboard';

interface MonthlyRunsChartProps {
  data: DashboardMonthPoint[];
}

interface DailyRunsChartProps {
  data: DashboardDayPoint[];
}

function EmptyChart({ message = 'No data for this date range.' }: { message?: string }) {
  return <div className="h-56 flex items-center justify-center text-sm text-text-muted">{message}</div>;
}

function ChartTooltip({ children, left }: { children: ReactNode; left: number }) {
  return (
    <div
      className="pointer-events-none absolute top-8 z-20 min-w-[170px] -translate-x-1/2 rounded-md border border-border bg-surface px-3 py-2 text-xs text-text shadow-[0_4px_14px_rgba(15,23,42,0.14)]"
      style={{ left: `${Math.min(Math.max(left, 12), 88)}%` }}
    >
      {children}
    </div>
  );
}

export function MonthlyRunsChart({ data }: MonthlyRunsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  if (data.length === 0) return <EmptyChart />;

  const width = 760;
  const height = 250;
  const plot = { left: 42, right: 16, top: 18, bottom: 42 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const maxValue = Math.max(...data.map((point) => point.count), 1);
  const slotWidth = plotWidth / data.length;
  const barWidth = Math.min(54, slotWidth * 0.56);

  return (
    <div className="relative w-full min-h-[250px] overflow-visible">
      {hoveredIndex !== null && (
        <ChartTooltip left={((hoveredIndex + 0.5) / data.length) * 100}>
          <div className="font-semibold">Month: {new Date(`${data[hoveredIndex].month}-01T00:00:00.000Z`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
          <div className="mt-1 text-text-muted">Classification Runs: <span className="font-medium text-text">{data[hoveredIndex].count}</span></div>
        </ChartTooltip>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56" role="img" aria-label="Classification runs by month">
        {[0, 0.5, 1].map((fraction) => {
          const y = plot.top + plotHeight - fraction * plotHeight;
          return <line key={fraction} x1={plot.left} x2={width - plot.right} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="3 4" />;
        })}
        {data.map((point, index) => {
          const barHeight = (point.count / maxValue) * plotHeight;
          const x = plot.left + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = plot.top + plotHeight - barHeight;
          const label = new Date(`${point.month}-01T00:00:00.000Z`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
          return (
            <g key={point.month} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="#6366f1" />
              <text x={x + barWidth / 2} y={Math.max(y - 8, 12)} textAnchor="middle" className="fill-text text-[12px] font-semibold">{point.count}</text>
              <text x={x + barWidth / 2} y={height - 16} textAnchor="middle" className="fill-text-muted text-[12px]">{label}</text>
            </g>
          );
        })}
        <line x1={plot.left} x2={width - plot.right} y1={plot.top + plotHeight} y2={plot.top + plotHeight} stroke="#d1d5db" />
        <text x="10" y={plot.top + 5} className="fill-text-muted text-[11px]">{maxValue}</text>
        <text x="18" y={plot.top + plotHeight + 4} className="fill-text-muted text-[11px]">0</text>
      </svg>
    </div>
  );
}

export function DailyRunsChart({ data }: DailyRunsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  if (data.length === 0) return <EmptyChart />;

  const width = 760;
  const height = 250;
  const plot = { left: 38, right: 34, top: 18, bottom: 42 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const maxValue = Math.max(...data.map((point) => Math.max(point.count, point.cumulative)), 1);
  const slotWidth = data.length === 1 ? plotWidth : plotWidth / (data.length - 1);
  const barWidth = Math.min(28, Math.max(8, plotWidth / data.length * 0.62));
  const points = data.map((point, index) => {
    const x = plot.left + index * slotWidth;
    const y = plot.top + plotHeight - (point.cumulative / maxValue) * plotHeight;
    return `${x},${y}`;
  }).join(' ');
  const labelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="relative w-full min-h-[250px] overflow-visible">
      {hoveredIndex !== null && (
        <ChartTooltip left={(hoveredIndex / Math.max(data.length - 1, 1)) * 100}>
          <div className="font-semibold">Date: {new Date(`${data[hoveredIndex].date}T00:00:00.000Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div className="mt-1 text-text-muted">Daily Runs: <span className="font-medium text-text">{data[hoveredIndex].count}</span></div>
          <div className="text-text-muted">Cumulative Runs: <span className="font-medium text-text">{data[hoveredIndex].cumulative}</span></div>
        </ChartTooltip>
      )}
      <div className="flex items-center justify-end gap-5 text-xs text-text-muted mb-1">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" />Daily Runs</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-5 border-t border-dashed border-text-muted" />Cumulative Runs</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56" role="img" aria-label="Daily classification runs with cumulative count">
        {[0, 0.5, 1].map((fraction) => {
          const y = plot.top + plotHeight - fraction * plotHeight;
          return <line key={fraction} x1={plot.left} x2={width - plot.right} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="3 4" />;
        })}
        {data.map((point, index) => {
          const x = plot.left + index * slotWidth;
          const barHeight = (point.count / maxValue) * plotHeight;
          const y = plot.top + plotHeight - barHeight;
          const label = new Date(`${point.date}T00:00:00.000Z`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
          return (
            <g key={point.date} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <rect x={x - barWidth / 2} y={y} width={barWidth} height={barHeight} rx="3" fill="#6366f1" />
              {index % labelStep === 0 && <text x={x} y={height - 16} textAnchor="middle" className="fill-text-muted text-[11px]">{label}</text>}
            </g>
          );
        })}
        <polyline points={points} fill="none" stroke="#7c8798" strokeWidth="2" strokeDasharray="5 4" />
        {data.map((point, index) => {
          const x = plot.left + index * slotWidth;
          const y = plot.top + plotHeight - (point.cumulative / maxValue) * plotHeight;
          return <circle key={point.date} cx={x} cy={y} r="3" fill="#7c8798" />;
        })}
        <line x1={plot.left} x2={width - plot.right} y1={plot.top + plotHeight} y2={plot.top + plotHeight} stroke="#d1d5db" />
      </svg>
    </div>
  );
}