import { useCallback, useEffect, useState } from 'react';
import { getRuns } from '@/services/repositories/classificationRepository';
import type { ClassificationRun, RunListParams } from '@/types/run';
import { messages } from '@/constants/messages';

export function useRuns(params: RunListParams) {
  const [runs, setRuns] = useState<ClassificationRun[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRuns(params)
      .then((result) => {
        if (cancelled) return;
        setRuns(result.runs);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setError(messages.errors.loadRuns);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search, params.status, params.page, params.pageSize, reloadToken]);

  return { runs, total, loading, error, refetch };
}
