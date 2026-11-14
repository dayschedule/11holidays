import { createMiddleware } from '@tanstack/react-start';
import { getRequest, setResponseHeaders } from '@tanstack/react-start/server';
import { cacheHeaders, type CachePolicy } from '@/lib/cache';

/**
 * Cache headers for a GET server function. Applied only to the RPC request made during
 * client-side navigation; during SSR the function runs in-process and the page's own route
 * headers apply.
 */
export const cacheFor = (policy: CachePolicy) =>
  createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const result = await next();
    if (new URL(getRequest().url).pathname.startsWith('/_serverFn/')) {
      setResponseHeaders(new Headers(cacheHeaders(policy)));
    }
    return result;
  });
