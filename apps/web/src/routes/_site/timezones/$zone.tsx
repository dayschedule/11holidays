import { Link, createFileRoute, notFound, useHydrated } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryFlag } from '@/components/country-flag';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { HourFormatToggle, LiveClock, StatCard } from '@/components/time/time-ui';
import { Button } from '@/components/ui/button';
import { useHour12, useNow } from '@/hooks/use-now';
import { citiesInZone } from '@/lib/cities';
import { faqSchema, seo, webPageSchema } from '@/lib/seo';
import {
  formatClock,
  formatDifference,
  formatDuration,
  formatLongDate,
  formatOffset,
  formatShortDate,
  offsetChanges,
  offsetMinutes,
  partsAtOffset,
} from '@/lib/time';
import { abbreviationAtOffset, type Zone } from '@/lib/timezones';
import { getZonePage } from '@/server/time';
import { CACHE, cacheHeaders } from '@/lib/cache';

const displayName = (zone: Zone) => zone.name.replace(/_/g, ' ');

const COMPARE = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'];

/**
 * Everything on the page that comes from time zone data. The server sends its snapshot and the
 * browser hydrates with it, then recomputes: browsers and the server can ship different time zone
 * data (America/Winnipeg differed in 2026), and a mismatch breaks hydration.
 */
function zoneSnapshot(zoneName: string, ms: number) {
  const year = new Date(ms).getUTCFullYear();
  return {
    offset: offsetMinutes(ms, zoneName),
    changes: [...offsetChanges(zoneName, year), ...offsetChanges(zoneName, year + 1)],
    compare: Object.fromEntries(COMPARE.map((other) => [other, offsetMinutes(ms, other)])) as Record<string, number>,
  };
}

export const Route = createFileRoute('/_site/timezones/$zone')({
  loader: async ({ params }) => {
    const page = await getZonePage({ data: { slug: params.zone } });
    if (!page) throw notFound();
    return { ...page, tz: zoneSnapshot(page.zone.name, Date.now()) };
  },
  headers: () => cacheHeaders(CACHE.page),
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { zone, faq } = loaderData;
    const name = displayName(zone);
    const path = `/timezones/${params.zone}`;
    const offset = formatOffset(loaderData.tz.offset);
    return seo({
      title: `${name} Time Zone - Current Time, UTC Offset & DST | 11holidays`,
      description: `Current time in ${name} (${zone.label}), ${offset}. See its abbreviation, daylight saving dates, main cities and how it compares with other time zones.`,
      keywords: [`${name} time zone`, `${name} time`, `${zone.label}`, `${zone.name} utc offset`],
      path,
      jsonLd: [webPageSchema(path, `${name} time zone`), faqSchema(faq)],
    });
  },
  component: ZonePage,
});

function ZonePage() {
  const { zone, faq, tz: serverTz } = Route.useLoaderData();
  const now = useNow(10_000);
  const hydrated = useHydrated();
  const [hour12] = useHour12();

  const tz = hydrated ? zoneSnapshot(zone.name, now.getTime()) : serverTz;
  const { offset, changes } = tz;
  const parts = partsAtOffset(now, offset);
  const hasDst = changes.length > 0;
  const name = displayName(zone);
  const abbreviation = abbreviationAtOffset(zone, offset);
  const cities = citiesInZone(zone.name).slice(0, 18);

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-4">
        <Breadcrumb
          items={[{ label: 'Home', to: '/' }, { label: 'Time zones', to: '/timezones' }, { label: name }]}
        />
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{name} time zone</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {zone.label}
            {zone.countryName && ` in ${zone.countryName}`}.
          </p>
        </div>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-card p-6 shadow-xs sm:p-8">
        <div>
          <LiveClock timeZone={zone.name} seconds className="block text-5xl font-bold tracking-tight sm:text-7xl" />
          <p className="mt-2 text-muted-foreground" suppressHydrationWarning>
            {formatLongDate(parts)}
          </p>
        </div>
        <HourFormatToggle />
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="UTC offset" value={formatOffset(offset)} />
        <StatCard label="Abbreviation" value={abbreviation || '–'} />
        <StatCard label="Daylight saving" value={hasDst ? (offset > zone.std ? 'In effect' : 'Not now') : 'None'} />
        <StatCard label="Region" value={zone.continent} hint={zone.countryName} />
      </div>

      {hasDst && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Clock changes in {name}</h2>
          <ul className="divide-y rounded-2xl border bg-card text-sm shadow-xs">
            {changes.map((c) => (
              <li key={c.at.toISOString()} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <span className="font-medium">
                  {formatShortDate(partsAtOffset(c.at, c.to))} {c.at.getUTCFullYear()}
                </span>
                <span className="text-muted-foreground">
                  Clocks go {c.to > c.from ? 'forward' : 'back'} {formatDuration(c.to - c.from)}: {formatOffset(c.from)} to{' '}
                  {formatOffset(c.to)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Compared with other time zones</h2>
        <ul className="divide-y rounded-2xl border bg-card text-sm shadow-xs">
          {COMPARE.filter((other) => other !== zone.name).map((other) => {
            const otherOffset = tz.compare[other] ?? 0;
            const difference = otherOffset - offset;
            return (
              <li key={other} className="flex items-center justify-between gap-3 p-3">
                <span className="font-medium">{other.replace(/_/g, ' ')}</span>
                <span className="text-muted-foreground">{formatDifference(difference)}</span>
                <span className="w-24 text-right font-medium tabular-nums">{formatClock(partsAtOffset(now, otherOffset), hour12)}</span>
              </li>
            );
          })}
        </ul>
        <Button variant="outline" asChild>
          <Link to="/time-zone-converter">
            Open the time zone converter <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {cities.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Cities in this time zone</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                to="/time/$city"
                params={{ city: city.slug }}
                className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm shadow-xs transition hover:border-primary/40"
              >
                <CountryFlag countryCode={city.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                <span className="truncate font-medium">{city.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FaqSection items={faq} />
    </PageLayout>
  );
}
