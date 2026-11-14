import { env } from 'cloudflare:workers';
import { createStartHandler, createServerEntry, defaultStreamHandler } from '@tanstack/react-start/server';
import { EDGE_CACHE_HEADER } from './lib/cache';

/**
 * Edge cache for SSR pages and GET server functions, built on the Workers Cache API.
 *
 * Static assets never reach this Worker, so they stay free. A response is cached only when it
 * opts in with a `CDN-Cache-Control: max-age=N, stale-while-revalidate=M` header (see
 * src/lib/cache.ts). Within N seconds it is served as is; until N+M it is served stale while a
 * fresh copy renders in the background.
 *
 * The Cache API is per data center and does not run on workers.dev, only on the custom domain.
 * Entries are keyed by deployment version, so a deploy never serves HTML that points at
 * replaced /assets/* files.
 */

const startEntry = createServerEntry({ fetch: createStartHandler(defaultStreamHandler) });

const STORED_AT = 'X-Edge-Stored-At';
const FRESH_FOR = 'X-Edge-Fresh-For';
const BROWSER_CACHE_CONTROL = 'X-Browser-Cache-Control';

/** Cloudflare's per-data-center cache; the DOM lib types hide `caches.default` */
const edgeCache = () => (caches as unknown as { default: Cache }).default;

/** Background refreshes running in this isolate, so a stale entry is re-rendered only once */
const refreshing = new Set<string>();

function cacheKey(request: Request): Request {
  const url = new URL(request.url);
  url.searchParams.set('__v', env.CF_VERSION_METADATA?.id ?? 'dev');
  return new Request(url.toString(), { method: 'GET' });
}

function parseEdgePolicy(value: string | null) {
  if (!value) return null;
  const maxAge = Number(/(?:^|,)\s*max-age=(\d+)/.exec(value)?.[1]);
  if (!maxAge) return null;
  const swr = Number(/stale-while-revalidate=(\d+)/.exec(value)?.[1] ?? 0);
  return { maxAge, swr };
}

/** Response to send to the visitor: without the edge policy header */
function forVisitor(response: Response): Response {
  const res = new Response(response.body, response);
  res.headers.delete(EDGE_CACHE_HEADER);
  return res;
}

/** Store a copy if it opted in; returns the response to send */
function store(key: Request, response: Response, ctx: ExecutionContext): Response {
  const policy = parseEdgePolicy(response.headers.get(EDGE_CACHE_HEADER));
  const cacheable = policy && response.status === 200 && !response.headers.has('Set-Cookie');
  if (!cacheable) return forVisitor(response);

  const [visitorBody, cacheBody] = response.body ? response.body.tee() : [null, null];
  const copy = new Response(cacheBody, response);
  copy.headers.delete(EDGE_CACHE_HEADER);
  copy.headers.set(BROWSER_CACHE_CONTROL, response.headers.get('Cache-Control') ?? 'no-cache');
  copy.headers.set('Cache-Control', `public, max-age=${policy.maxAge + policy.swr}`);
  copy.headers.set(STORED_AT, String(Date.now()));
  copy.headers.set(FRESH_FOR, String(policy.maxAge));
  ctx.waitUntil(edgeCache().put(key, copy));

  const res = forVisitor(new Response(visitorBody, response));
  res.headers.set('X-Edge-Cache', 'MISS');
  return res;
}

function refresh(request: Request, key: Request, ctx: ExecutionContext) {
  if (refreshing.has(key.url)) return;
  refreshing.add(key.url);
  ctx.waitUntil(
    (async () => {
      try {
        const response = await startEntry.fetch(new Request(request));
        const sent = store(key, response, ctx);
        await sent.body?.cancel();
      } catch (err) {
        console.error('Edge cache refresh failed', key.url, err);
      } finally {
        refreshing.delete(key.url);
      }
    })()
  );
}

function fromCache(hit: Response, status: 'HIT' | 'STALE'): Response {
  const ageSec = Math.floor((Date.now() - Number(hit.headers.get(STORED_AT))) / 1000);
  const res = new Response(hit.body, hit);
  res.headers.set('Cache-Control', hit.headers.get(BROWSER_CACHE_CONTROL) ?? 'no-cache');
  res.headers.set('Age', String(Math.max(0, ageSec)));
  res.headers.set('X-Edge-Cache', status);
  res.headers.delete(BROWSER_CACHE_CONTROL);
  res.headers.delete(STORED_AT);
  res.headers.delete(FRESH_FOR);
  return res;
}

export default {
  async fetch(request: Request, _env: unknown, ctx: ExecutionContext): Promise<Response> {
    const bypass = request.method !== 'GET' || request.headers.has('Authorization') || request.headers.has('Range');
    if (bypass) return startEntry.fetch(request);

    const key = cacheKey(request);
    const hit = await edgeCache().match(key);
    if (hit) {
      const age = (Date.now() - Number(hit.headers.get(STORED_AT))) / 1000;
      const fresh = age < Number(hit.headers.get(FRESH_FOR));
      if (!fresh) refresh(request, key, ctx);
      return fromCache(hit, fresh ? 'HIT' : 'STALE');
    }

    return store(key, await startEntry.fetch(request), ctx);
  },
};
