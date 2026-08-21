import { Button } from 'antd';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-10 h-10 rounded-full bg-error-bg text-error-text flex items-center justify-center">
        <AlertTriangle size={20} />
      </div>
      <span className="text-text-muted text-sm max-w-sm">{message}</span>
      {onRetry && (
        <Button onClick={onRetry} size="small">
          Try Again
        </Button>
      )}
    </div>
  );
}
