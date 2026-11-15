import { useCallback, useEffect, useRef, useState } from 'react';

export const AUTO_RETURN_MS = 5000;
const TICK_MS = 100;

interface TimerEntry {
  timeoutId: ReturnType<typeof setTimeout>;
  deadline: number;
}

/**
 * Owns the 5-second auto-return timers.
 * - `arm(id)`: start (or restart) the countdown for an item.
 * - `disarm(id)`: cancel it (item clicked back manually).
 * - `remainingOf(id)`: ms left, driven by a light ticker that only runs
 *   while at least one timer is active.
 *
 * Timers live in a ref and are created inside event handlers, so React
 * StrictMode's double-rendering never double-schedules them.
 */
export function useAutoReturnTimers(onReturn: (id: number) => void) {
  const timersRef = useRef(new Map<number, TimerEntry>());
  const [version, setVersion] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const onReturnRef = useRef(onReturn);
  onReturnRef.current = onReturn;

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const disarm = useCallback(
    (id: number) => {
      const entry = timersRef.current.get(id);
      if (!entry) return;
      clearTimeout(entry.timeoutId);
      timersRef.current.delete(id);
      bump();
    },
    [bump],
  );

  const arm = useCallback(
    (id: number) => {
      disarm(id);
      const timeoutId = setTimeout(() => {
        timersRef.current.delete(id);
        bump();
        onReturnRef.current(id);
      }, AUTO_RETURN_MS);
      timersRef.current.set(id, { timeoutId, deadline: Date.now() + AUTO_RETURN_MS });
      bump();
    },
    [disarm, bump],
  );

  const disarmAll = useCallback(() => {
    timersRef.current.forEach((entry) => clearTimeout(entry.timeoutId));
    timersRef.current.clear();
  }, []);

  // Tick only while a countdown is running.
  useEffect(() => {
    if (timersRef.current.size === 0) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [version]);

  useEffect(() => disarmAll, [disarmAll]);

  const remainingOf = useCallback(
    (id: number) => {
      const entry = timersRef.current.get(id);
      if (!entry) return 0;
      return Math.max(0, Math.min(AUTO_RETURN_MS, entry.deadline - now));
    },
    [now],
  );

  const isRunning = (id: number) => timersRef.current.has(id);

  return { arm, disarm, remainingOf, isRunning, now };
}
