import { lazy, Suspense } from 'react';
import { ClientOnly, createFileRoute, Link } from '@tanstack/react-router';
import { KeyRound } from 'lucide-react';
import { OPENAPI_URL, seo, webApiSchema } from '@/lib/seo';

// Scalar touches `window` on import, so it only loads in the browser
const ScalarWrapper = lazy(() =>
  import('@/components/docs/scalar-wrapper').then((m) => ({ default: m.ScalarWrapper }))
);

export const Route = createFileRoute('/_site/docs/api')({
  head: () => {
    const head = seo({
      title: 'Holidays API Reference & Docs | 11holidays.com',
      description:
        'REST API reference for the 11holidays API: list public holidays, bank holidays and observances of 230+ countries by year, with request examples and an interactive playground.',
      path: '/docs/api',
      jsonLd: [webApiSchema()],
    });
    return {
      ...head,
      links: [...head.links, { rel: 'service-desc', type: 'application/json', href: OPENAPI_URL }],
    };
  },
  component: ApiReference,
});

function Loading() {
  return <div className="py-24 text-sm text-muted-foreground">Loading API reference...</div>;
}

function ApiReference() {
  return (
    // Scalar's sticky sidebar starts below the site header
    <div className="[--scalar-custom-header-height:68px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b py-4">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Holidays API reference</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            OpenAPI spec:{' '}
            <a href={OPENAPI_URL} className="font-mono text-foreground underline underline-offset-2">
              openapi.json
            </a>
          </span>
          <Link to="/api-key" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
            <KeyRound className="size-3.5" /> Get API key
          </Link>
        </div>
      </div>
      <ClientOnly fallback={<Loading />}>
        <Suspense fallback={<Loading />}>
          <ScalarWrapper />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
