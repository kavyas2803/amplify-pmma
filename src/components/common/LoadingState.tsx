import { Spin } from 'antd';

interface LoadingStateProps {
  label?: string;
  fullHeight?: boolean;
}

export function LoadingState({ label = 'Loading...', fullHeight }: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 ${fullHeight ? 'min-h-[60vh]' : ''}`}
    >
      <Spin size="large" />
      <span className="text-text-muted text-sm">{label}</span>
    </div>
  );
}
