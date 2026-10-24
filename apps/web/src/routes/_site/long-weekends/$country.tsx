import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { ArrowRight, Palmtree } from 'lucide-react';
import { z } from 'zod';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryFlag } from '@/components/country-flag';
import { LongWeekendsTable } from '@/components/long-weekends-table';
import { OccasionsList } from '@/components/occasions-list';
import { PageLayout } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCountryBySlug } from '@/lib/countries-data';
import { generateLongWeekends } from '@/lib/long-weekends';
import { SITE_URL, seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { getCountryHolidays, getUpcomingOccasions } from '@/server/holidays';

export const Route = createFileRoute('/_site/long-weekends/$country')({
  validateSearch: z.object({ year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined) }),
  loaderDeps: ({ search }) => ({ year: search.year ?? new Date().getFullYear() }),
  loader: async ({ params, deps }) => {
    const country = getCountryBySlug(params.country);
    if (!country) throw notFound();
    const [{ holidays }, occasions] = await Promise.all([
      getCountryHolidays({ data: { code: country.code, year: deps.year } }),
      getUpcomingOccasions({ data: { code: country.code, limit: 4 } }),
    ]);
    return { country, year: deps.year, holidays, occasions };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? seo({
          title: `Long Weekends in ${loaderData.year} - ${loaderData.country.name} | 11holidays`,
          description: `List of long weekends in ${loaderData.country.name} for ${loaderData.year}. Plan trips with extended weekends and find which leaves to take for the longest breaks.`,
          path: `/long-weekends/${params.country}`,
          jsonLd: [
            {
              '@type': 'ItemList',
              name: `Long weekends in ${loaderData.country.name} ${loaderData.year}`,
              itemListElement: generateLongWeekends(loaderData.holidays).map((lw, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'Event',
                  name: `${lw.occasion} long weekend (${lw.days} days)`,
                  description: lw.tip,
                  startDate: lw.startDate,
                  endDate: lw.endDate,
                  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                  eventStatus: 'https://schema.org/EventScheduled',
                  location: { '@type': 'Country', name: loaderData.country.name },
                  url: `${SITE_URL}/long-weekends/${params.country}`,
                },
              })),
            },
          ],
        })
      : {},
  component: LongWeekendsPage,
});

function LongWeekendsPage() {
  const { country, year, holidays, occasions } = Route.useLoaderData();
  const today = startOfDay(new Date());
  const longWeekends = generateLongWeekends(holidays);
  const upcoming = longWeekends.filter((lw) => isAfter(parseISO(lw.endDate), today)).slice(0, 5);
  const thisYear = new Date().getFullYear();

  return (
    <PageLayout country={country}>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Countries', to: '/countries' },
          { label: `Long Weekends in ${year} ${country.name}` },
        ]}
      />

      <div className="flex items-center gap-4">
        <CountryFlag countryCode={country.code} className="h-10 w-14 shrink-0 rounded-md shadow-md" />
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Long Weekends in {year} · {country.name}
          </h1>
          <p className="text-muted-foreground">Make the most of your leaves with these extended breaks</p>
        </div>
      </div>

      <div className="flex gap-1 self-start rounded-full border bg-card p-1">
        {[thisYear, thisYear + 1].map((y) => (
          <Link
            key={y}
            to="/long-weekends/$country"
            params={{ country: country.slug! }}
            search={{ year: y === thisYear ? undefined : y }}
            className={cn(
              'rounded-full px-4 py-1 text-sm font-medium',
              y === year ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
          >
            {y}
          </Link>
        ))}
      </div>

      {upcoming.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2">
          {upcoming.map((lw, i) => (
            <div
              key={lw.id}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-5 shadow-xs',
                i === 0 ? 'bg-gradient-to-br from-festive-teal/15 via-festive-saffron/10 to-festive-coral/10 sm:col-span-2' : 'bg-card'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {i === 0 && <p className="text-xs font-semibold uppercase tracking-wider text-primary">Next long weekend</p>}
                  <p className="text-lg font-semibold">{lw.occasion}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(lw.startDate), 'EEE d MMM')} – {format(parseISO(lw.endDate), 'EEE d MMM yyyy')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 text-3xl font-bold">
                    <Palmtree className="h-5 w-5 text-festive-teal" />
                    {lw.days}
                  </span>
                  <span className="text-xs text-muted-foreground">days off</span>
                </div>
              </div>
              {lw.leavesNeeded > 0 && (
                <Badge variant="secondary" className="mt-3">
                  {lw.leavesNeeded} leave{lw.leavesNeeded > 1 ? 's' : ''} needed
                </Badge>
              )}
              {lw.tip && <p className="mt-2 text-sm text-muted-foreground">{lw.tip}</p>}
            </div>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">
            All long weekends in {year}
          </h2>
          <p className="text-sm text-muted-foreground">
            Month-wise list showing dates, total days off and the holidays that make them possible.
          </p>
        </div>
        <LongWeekendsTable longWeekends={longWeekends} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Explore more holidays in {country.name}</h2>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to="/holidays/$country" params={{ country: country.code.toLowerCase() }}>
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <OccasionsList occasions={occasions} />
      </section>
    </PageLayout>
  );
}
