import { useCallback, useEffect, useState } from 'react';
import { getRuns } from '@/services/repositories/classificationRepository';
import type { ClassificationRun, RunListParams } from '@/types/run';
import { messages } from '@/constants/messages';

interface RefetchOptions {
  silent?: boolean;
}

export function useRuns(params: RunListParams) {
  const [runs, setRuns] = useState<ClassificationRun[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [silentReloadToken, setSilentReloadToken] = useState(0);

  const refetch = useCallback((options?: RefetchOptions) => {
    if (options?.silent) {
      setSilentReloadToken((t) => t + 1);
      return;
    }

    setReloadToken((t) => t + 1);
  }, []);

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

  useEffect(() => {
    if (silentReloadToken === 0) return;

    let cancelled = false;

    getRuns(params)
      .then((result) => {
        if (cancelled) return;
        setRuns(result.runs);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setError(messages.errors.loadRuns);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [silentReloadToken, params.search, params.status, params.page, params.pageSize]);

  return { runs, total, loading, error, refetch };
}