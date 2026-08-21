import { useEffect, useRef } from 'react';
import { env } from '@/config/environment';

/**
 * Polls by invoking `onTick` at a fixed interval while `shouldPoll` is true.
 * Stops automatically when `shouldPoll` becomes false or the component
 * unmounts. Guards against overlapping intervals.
 */
export function useRunPolling(shouldPoll: boolean, onTick: () => void, intervalMs: number = env.pollingIntervalMs) {
  const savedCallback = useRef(onTick);
  savedCallback.current = onTick;

  useEffect(() => {
    if (!shouldPoll) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [shouldPoll, intervalMs]);
}
