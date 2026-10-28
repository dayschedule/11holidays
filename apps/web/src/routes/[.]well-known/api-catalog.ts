import { createFileRoute } from '@tanstack/react-router';
import { API_URL, OPENAPI_URL, SITE_URL } from '@/lib/seo';

/** API discovery for agents and tooling, see RFC 9727 (application/linkset+json) */
const apiCatalog = {
  linkset: [
    {
      anchor: API_URL,
      'service-desc': [{ href: OPENAPI_URL, type: 'application/vnd.oai.openapi+json' }],
      'service-doc': [{ href: `${SITE_URL}/docs/api`, type: 'text/html' }],
      'terms-of-service': [{ href: `${SITE_URL}/terms`, type: 'text/html' }],
      describedby: [{ href: `${SITE_URL}/llms.txt`, type: 'text/plain' }],
    },
  ],
};

export const Route = createFileRoute('/.well-known/api-catalog')({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(apiCatalog, null, 2), {
          headers: {
            'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          },
        }),
    },
  },
});
