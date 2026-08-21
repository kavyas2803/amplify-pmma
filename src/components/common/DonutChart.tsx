import { useRef, useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerValue?: string | number;
  centerLabel?: string;
}

/**
 * Lightweight, dependency-free donut chart built from stacked SVG circle
 * strokes. Segments with a value of 0 are skipped in the ring itself but
 * still expected to be rendered in an accompanying <DonutLegend />.
 */
export function DonutChart({ segments, size = 168, strokeWidth = 23, centerValue, centerLabel }: DonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<{ segment: DonutSegment; x: number; y: number } | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <div
      ref={chartRef}
      className="relative shrink-0"
      style={{ width: size, height: size }}
      onMouseLeave={() => setHoveredSegment(null)}
    >
      {hoveredSegment && (
        <div
          className="pointer-events-none absolute z-20 min-w-[145px] -translate-x-1/2 -translate-y-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text shadow-[0_4px_14px_rgba(15,23,42,0.14)]"
          style={{ left: hoveredSegment.x, top: Math.max(hoveredSegment.y - 8, 8) }}
        >
          <div className="font-semibold">{hoveredSegment.segment.label}</div>
          <div className="mt-1 text-text-muted">Count: <span className="font-medium text-text">{hoveredSegment.segment.value}</span></div>
          <div className="text-text-muted">Percentage: <span className="font-medium text-text">{total > 0 ? Math.round((hoveredSegment.segment.value / total) * 100) : 0}%</span></div>
        </div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-page-background)" strokeWidth={strokeWidth} />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => {
              const fraction = s.value / total;
              const dash = fraction * circumference;
              const offset = -cumulative * circumference;
              cumulative += fraction;
              return (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseMove={(event) => {
                    const bounds = chartRef.current?.getBoundingClientRect();
                    if (!bounds) return;
                    setHoveredSegment({
                      segment: s,
                      x: event.clientX - bounds.left,
                      y: event.clientY - bounds.top,
                    });
                  }}
                />
              );
            })}
      </svg>
      {(centerValue !== undefined || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue !== undefined && <div className="text-xl font-bold text-text leading-none">{centerValue}</div>}
          {centerLabel && (
            <div className="text-[10px] font-medium uppercase tracking-[0.02em] text-text-muted mt-1">{centerLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}

interface DonutLegendProps {
  segments: DonutSegment[];
  total: number;
}

export function DonutLegend({ segments, total }: DonutLegendProps) {
  return (
    <ul className="grid grid-cols-1 gap-y-2.5 list-none p-0 m-0 w-[270px] max-w-full">
      {segments.map((s) => {
        const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
        return (
          <li
            key={s.label}
            className="legend-item grid grid-cols-[10px_140px_auto] items-center gap-x-2"
          >
            <span className="legend-color w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="legend-label text-xs text-text truncate">{s.label}</span>
            <span className="legend-value text-xs text-text-muted font-medium whitespace-nowrap justify-self-end inline-flex items-center gap-1">
              <span className="legend-count">{s.value}</span>
              <span className="legend-percentage text-text-subtle">({pct}%)</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
