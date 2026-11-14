/**
 * Cache policies, in seconds.
 *
 * - `browser`: the visitor's browser cache (`Cache-Control`). Keep it short for HTML: cached HTML
 *   references hashed /assets/* files that are replaced on every deploy.
 * - `edge`: how long the Cloudflare edge cache (src/server.ts) serves a copy without running SSR.
 * - `edgeSwr`: after `edge`, how long a stale copy is still served while a fresh one renders in
 *   the background.
 */
export interface CachePolicy {
  browser: number;
  browserSwr?: number;
  edge: number;
  edgeSwr: number;
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const CACHE = {
  /** HTML pages whose content only changes when the holidays database changes (default) */
  page: { browser: MINUTE, edge: HOUR, edgeSwr: DAY },
  /** HTML pages that show "today" or "upcoming" data */
  daily: { browser: MINUTE, edge: 10 * MINUTE, edgeSwr: HOUR },
  /** Server function JSON for holiday and occasion data, used on client-side navigation */
  data: { browser: 5 * MINUTE, browserSwr: HOUR, edge: HOUR, edgeSwr: DAY },
  /** Server function JSON that depends on the current date */
  dailyData: { browser: MINUTE, browserSwr: 10 * MINUTE, edge: 10 * MINUTE, edgeSwr: HOUR },
  /** Embeds on third-party sites */
  embed: { browser: 15 * MINUTE, edge: HOUR, edgeSwr: DAY },
  /** Files that rarely change: sitemap, llms.txt, .well-known, ICS feeds */
  file: { browser: HOUR, edge: 6 * HOUR, edgeSwr: 7 * DAY },
} satisfies Record<string, CachePolicy>;

/** Edge policy header read (and removed) by the edge cache in src/server.ts */
export const EDGE_CACHE_HEADER = 'CDN-Cache-Control';

export function cacheHeaders(policy: CachePolicy): Record<string, string> {
  const browserSwr = policy.browserSwr ? `, stale-while-revalidate=${policy.browserSwr}` : '';
  return {
    'Cache-Control': `public, max-age=${policy.browser}${browserSwr}`,
    [EDGE_CACHE_HEADER]: `max-age=${policy.edge}, stale-while-revalidate=${policy.edgeSwr}`,
  };
}
