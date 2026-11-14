import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLoaderData } from '@tanstack/react-router';

/**
 * The real current instant, ticking after hydration. Until then it is the server's render time, so
 * server and browser agree and React doesn't warn, and a stale cached page corrects itself on load.
 * Unlike `useToday` this is a true instant, for formatting in a specific time zone.
 */
export function useNow(intervalMs = 1000): Date {
  const serverMs = useLoaderData({ from: '__root__', select: (d) => d.nowMs });
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return new Date(now ?? serverMs);
}

const STORAGE_KEY = 'hour-format';
const listeners = new Set<() => void>();

function readHour12() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === '12';
  } catch {
    // storage blocked
  }
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12 ?? false;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The visitor's 12/24 hour choice, shared by every clock. Falls back to their locale, and 24h on the server. */
export function useHour12() {
  const hour12 = useSyncExternalStore(subscribe, readHour12, () => false);
  const setHour12 = (value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, value ? '12' : '24');
    } catch {
      // storage blocked
    }
    listeners.forEach((l) => l());
  };
  return [hour12, setHour12] as const;
}
