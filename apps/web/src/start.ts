import { createMiddleware, createStart } from '@tanstack/react-start';
import { OPENAPI_URL } from '@/lib/seo';

/** RFC 8288 Link header so agents can discover the API and llms.txt from any page */
const DISCOVERY_LINKS = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</.well-known/api-catalog>; rel="api-catalog"',
  `<${OPENAPI_URL}>; rel="service-desc"; type="application/vnd.oai.openapi+json"`,
  '</docs/api>; rel="service-doc"; type="text/html"',
].join(', ');

const agentDiscovery = createMiddleware().server(async ({ next }) => {
  const result = await next();
  const { response } = result;
  if (!response.headers.get('Content-Type')?.includes('text/html')) return result;

  // Copy the response, headers can be immutable
  const headers = new Headers(response.headers);
  headers.append('Link', DISCOVERY_LINKS);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [agentDiscovery],
}));
