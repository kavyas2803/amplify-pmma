import { useCallback, useEffect, useState } from 'react';
import { getRunLineItems } from '@/services/repositories/classificationRepository';
import type { LineItem, LineItemListParams } from '@/types/lineItem';
import { messages } from '@/constants/messages';

export function useLineItems(params: LineItemListParams) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRunLineItems(params)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) setError(messages.errors.loadLineItems);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.runId,
    params.search,
    params.taxClassification,
    params.status,
    params.confidenceBand,
    params.vendor,
    params.profitCenter,
    params.page,
    params.pageSize,
    reloadToken,
  ]);

  return { items, total, loading, error, refetch };
}
