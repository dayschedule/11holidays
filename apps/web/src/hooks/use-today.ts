import { useMemo } from 'react';
import { useHydrated, useLoaderData } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';

/** Server's wall-clock time, sent with the page from the root loader */
export const serverNow = () => format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

/**
 * Current date that is safe to render. Pages are rendered in UTC and edge-cached, so during
 * SSR and hydration this is the server's render time, then it switches to the visitor's clock.
 * Rendering `new Date()` directly breaks hydration (React error #418).
 */
export function useToday(): Date {
  const now = useLoaderData({ from: '__root__', select: (d) => d.now });
  const hydrated = useHydrated();
  return useMemo(() => (hydrated ? new Date() : parseISO(now)), [hydrated, now]);
}
