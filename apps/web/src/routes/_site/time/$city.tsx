import { Link, createFileRoute, notFound, redirect, useHydrated } from '@tanstack/react-router';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { CalendarDays, Clock, Sunrise, Sunset } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryFlag } from '@/components/country-flag';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { DayPhaseIcon, HourFormatToggle, LiveClock, StatCard } from '@/components/time/time-ui';
import { Button } from '@/components/ui/button';
import { useHour12, useNow } from '@/hooks/use-now';
import { useToday } from '@/hooks/use-today';
import { citiesInCountry, getPlace, HUB_CITIES } from '@/lib/cities';
import { getCountryByCode } from '@/lib/countries-data';
import { occasionParams } from '@/lib/holidays-api';
import { faqSchema, seo, webPageSchema } from '@/lib/seo';
import { sunTimes } from '@/lib/sun';
import {
  browserTimeZone,
  dayDifference,
  formatClock,
  formatDifference,
  formatDuration,
  formatLongDate,
  formatOffset,
  formatShortDate,
  nextOffsetChange,
  offsetMinutes,
  zonedParts,
} from '@/lib/time';
import { getZone, zoneAbbreviation, zoneSlug } from '@/lib/timezones';
import { getCityPage } from '@/server/time';
import { CACHE, cacheHeaders } from '@/lib/cache';

export const Route = createFileRoute('/_site/time/$city')({
  loader: async ({ params }) => {
    const page = await getCityPage({ data: { slug: params.city } });
    if (!page) throw notFound();
    if (page.kind === 'alias') throw redirect({ to: '/time/$city', params: { city: page.alias }, statusCode: 301 });
    return page;
  },
  headers: () => cacheHeaders(CACHE.page),
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { city, country, zoneLabel, faq } = loaderData;
    const label = `${city.name}, ${country}`;
    const path = `/time/${params.city}`;
    return seo({
      title: `Current Time in ${label} - Time Zone, Sunrise & Holidays | 11holidays`,
      description: `What time is it in ${label}? Live local time, ${zoneLabel ?? 'time zone'}, UTC offset, sunrise and sunset, daylight saving dates and upcoming public holidays.`,
      keywords: [`time in ${city.name}`, `current time in ${city.name}`, `${city.name} time zone`, `what time is it in ${city.name}`, `${city.name} local time`],
      path,
      jsonLd: [
        webPageSchema(path, `Current time in ${label}`),
        {
          '@type': 'City',
          name: city.name,
          containedInPlace: { '@type': 'Country', name: country },
          geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
        },
        faqSchema(faq),
      ],
    });
  },
  component: CityTimePage,
});

function CityTimePage() {
  const { city, upcoming, faq } = Route.useLoaderData();
  const now = useNow(10_000);
  const today = useToday();
  const hydrated = useHydrated();
  const [hour12] = useHour12();

  const zone = getZone(city.timeZone)!;
  const country = getCountryByCode(city.code);
  const parts = zonedParts(now, city.timeZone);
  const offset = offsetMinutes(now, city.timeZone);
  const abbreviation = zoneAbbreviation(zone, now);
  const change = nextOffsetChange(city.timeZone, now);
  const sun = sunTimes(parts.year, parts.month, parts.day, city.lat, city.lng);
  const clock = (date: Date | null) => (date ? formatClock(zonedParts(date, city.timeZone), hour12) : '–');

  const visitorZone = hydrated ? browserTimeZone() : undefined;
  const comparison = [
    ...(visitorZone ? [{ key: 'you', label: 'Your time', timeZone: visitorZone, slug: undefined }] : []),
    ...HUB_CITIES.filter((slug) => slug !== city.slug).flatMap((slug) => {
      const hub = getPlace(slug);
      return hub ? [{ key: slug, label: hub.name, timeZone: hub.timeZone, slug }] : [];
    }),
  ];

  const nearby = citiesInCountry(city.code).filter((c) => c.slug !== city.slug).slice(0, 12);

  return (
    <PageLayout country={country}>
      <div className="space-y-4">
        <Breadcrumb
          items={[{ label: 'Home', to: '/' }, { label: 'World clock', to: '/world-clock' }, { label: city.name }]}
        />
        <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          <CountryFlag countryCode={city.code} className="h-6 w-9 shrink-0 rounded-[3px] shadow-xs" />
          Current time in {city.name}
          {country && `, ${country.name}`}
        </h1>
      </div>

      <section className="rounded-3xl border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <LiveClock timeZone={city.timeZone} seconds className="block text-5xl font-bold tracking-tight sm:text-7xl" />
            <p className="mt-2 flex items-center gap-2 text-muted-foreground" suppressHydrationWarning>
              <DayPhaseIcon hour={parts.hour} /> {formatLongDate(parts)}
            </p>
          </div>
          <HourFormatToggle />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Time zone"
          value={
            <Link to="/timezones/$zone" params={{ zone: zoneSlug(zone.name) }} className="hover:text-primary hover:underline">
              {abbreviation || formatOffset(offset).replace(':00', '')}
            </Link>
          }
          hint={zone.label}
        />
        <StatCard label="UTC offset" value={formatOffset(offset)} hint={city.timeZone.replace(/_/g, ' ')} />
        <StatCard
          label={sun.polar ? 'Daylight' : 'Sunrise'}
          value={sun.polar ? (sun.polar === 'day' ? 'Midnight sun' : 'Polar night') : clock(sun.sunrise)}
          hint={
            <span className="inline-flex items-center gap-1">
              <Sunrise className="h-4 w-4" aria-hidden /> Today
            </span>
          }
        />
        <StatCard
          label="Sunset"
          value={clock(sun.sunset)}
          hint={
            <span className="inline-flex items-center gap-1">
              <Sunset className="h-4 w-4" aria-hidden /> {formatDuration(sun.dayLength)} of daylight
            </span>
          }
        />
      </div>

      <p className="rounded-2xl border bg-card p-4 text-sm shadow-xs">
        {change ? (
          <>
            <strong>Next clock change:</strong> clocks go {change.to > change.from ? 'forward' : 'back'}{' '}
            {formatDuration(change.to - change.from)} on {formatShortDate(zonedParts(change.at, city.timeZone))}{' '}
            {change.at.getUTCFullYear()}.
          </>
        ) : (
          <>
            <strong>No daylight saving:</strong> {city.name} stays at {formatOffset(offset)} all year.
          </>
        )}
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{city.name} compared with the world</h2>
        <ul className="divide-y rounded-2xl border bg-card text-sm shadow-xs">
          {comparison.map((row) => {
            const other = zonedParts(now, row.timeZone);
            const dayShift = dayDifference(parts, other);
            return (
              <li key={row.key} className="flex items-center gap-3 p-3">
                <DayPhaseIcon hour={other.hour} />
                {row.slug ? (
                  <Link to="/time/$city" params={{ city: row.slug }} className="flex-1 font-medium hover:text-primary hover:underline">
                    {row.label}
                  </Link>
                ) : (
                  <span className="flex-1 font-medium">{row.label}</span>
                )}
                <span className="hidden text-muted-foreground sm:inline">
                  {formatDifference(offsetMinutes(now, row.timeZone) - offset)}
                </span>
                <span className="w-32 text-right font-medium tabular-nums">
                  {formatClock(other, hour12)}
                  {dayShift !== 0 && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">{dayShift > 0 ? 'next day' : 'prev day'}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/time-zone-converter" search={{ from: city.slug }}>
              <Clock className="h-4 w-4" /> Convert {city.name} time
            </Link>
          </Button>
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Upcoming holidays in {country?.name}</h2>
          <ul className="divide-y rounded-2xl border bg-card text-sm shadow-xs">
            {upcoming.map((o) => (
              <li key={o.occasion_id}>
                <Link
                  to="/holidays/$country/$slug"
                  params={occasionParams(o.url)}
                  className="flex items-center justify-between gap-3 p-3 hover:text-primary"
                >
                  <span className="font-medium">{o.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {format(parseISO(o.date), 'EEE, d MMM')} · in {Math.max(0, differenceInCalendarDays(parseISO(o.date), today))} days
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {country?.slug && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/calendars/$country" params={{ country: country.slug }}>
                <CalendarDays className="h-4 w-4" /> {country.name} holiday calendar
              </Link>
            </Button>
          )}
        </section>
      )}

      {nearby.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Other cities in {country?.name}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((c) => (
              <Link
                key={c.slug}
                to="/time/$city"
                params={{ city: c.slug }}
                className="flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-sm shadow-xs transition hover:border-primary/40"
              >
                <span className="truncate font-medium">{c.name}</span>
                <LiveClock timeZone={c.timeZone} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <FaqSection items={faq} />
    </PageLayout>
  );
}
