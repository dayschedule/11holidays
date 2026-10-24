import { Link, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { OccasionsList } from '@/components/occasions-list';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { currentYear } from '@/lib/holidays-api';
import { seo } from '@/lib/seo';
import { getOccasions } from '@/server/holidays';

const LIMIT = 20;

export const Route = createFileRoute('/_site/holidays/')({
  validateSearch: z.object({ offset: z.coerce.number().int().min(0).optional().catch(undefined) }),
  loaderDeps: ({ search }) => ({ offset: search.offset ?? 0 }),
  loader: async ({ deps }) => ({
    occasions: await getOccasions({ data: { offset: deps.offset, limit: LIMIT } }),
    offset: deps.offset,
  }),
  head: ({ loaderData }) =>
    seo({
      title: `Holidays & Festivals ${currentYear} - 11holidays.com`,
      description: 'Browse public and religious holidays around the world. Pick a country or search by name.',
      path: loaderData?.offset ? `/holidays?offset=${loaderData.offset}` : '/holidays',
    }),
  component: HolidaysPage,
});

function HolidaysPage() {
  const { occasions, offset } = Route.useLoaderData();
  const hasPrevious = offset > 0;
  const hasNext = occasions.length >= LIMIT;

  return (
    <PageLayout>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Holidays &amp; festivals in {currentYear}
        </h1>
        <p className="text-muted-foreground">
          Discover holidays celebrated around the world, or{' '}
          <Link to="/countries" className="text-primary underline">
            pick a country
          </Link>{' '}
          to see its full {currentYear} list.
        </p>
      </div>

      <OccasionsList occasions={occasions} />

      {(hasPrevious || hasNext) && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          {hasPrevious ? (
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/holidays" search={{ offset: offset - LIMIT || undefined }} rel="prev">
                Previous
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {hasNext && (
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/holidays" search={{ offset: offset + LIMIT }} rel="next">
                Next
              </Link>
            </Button>
          )}
        </nav>
      )}
    </PageLayout>
  );
}
