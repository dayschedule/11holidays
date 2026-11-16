import { Link, createFileRoute, useHydrated, useNavigate } from '@tanstack/react-router';
import { Home, X } from 'lucide-react';
import { z } from 'zod';
import { CopyButton } from '@/components/countdown-tools';
import { CountryFlag } from '@/components/country-flag';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { PlaceSelect } from '@/components/time/place-select';
import { DayPhaseIcon, HourFormatToggle, LiveClock } from '@/components/time/time-ui';
import { useNow } from '@/hooks/use-now';
import { citiesByRegion, cityForTimeZone, countryNameOf, HUB_CITIES, parsePlaces, type City } from '@/lib/cities';
import { cleanSearch, toQueryString } from '@/lib/custom-calendar';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { faqSchema, seo, SITE_URL, softwareAppSchema } from '@/lib/seo';
import { browserTimeZone, dayPhase, formatDifference, formatOffset, formatShortDate, offsetMinutes, zonedParts } from '@/lib/time';
import { cn } from '@/lib/utils';
import { CACHE, cacheHeaders } from '@/lib/cache';

const FAQ = [
  {
    q: 'How do I add a city to the world clock?',
    a: 'Press Add city and search by city or country. Remove a city with the cross on its card. The page link updates as you go, so bookmark it or share it to keep your list.',
  },
  {
    q: 'Does the world clock handle daylight saving time?',
    a: 'Yes. Every clock uses the IANA time zone rules built into your browser, so daylight saving changes apply automatically on the right date.',
  },
  {
    q: 'What do the colored bars mean?',
    a: 'Each bar is one day in that city. Green hours are typical office hours, amber is early morning or evening, and dark is night. The marker shows the time now, so you can see at a glance who is awake.',
  },
  {
    q: 'How do I find a good meeting time for these cities?',
    a: 'Once you know who is awake, the free meeting planner on DaySchedule compares working hours across cities and warns you about public holidays and weekends.',
    more: { label: 'Open the meeting planner', href: dayscheduleUrl('/tools/meeting-planner') },
  },
];

export const Route = createFileRoute('/_site/world-clock')({
  validateSearch: z.object({ cities: z.string().max(400).optional().catch(undefined) }),
  headers: () => cacheHeaders(CACHE.page),
  head: ({ match }) =>
    seo({
      title: 'World Clock - Current Time in Cities Around the World | 11holidays',
      description:
        'Live world clock with the current time in 700+ cities. Build your own list, compare it with your local time and see who is at work, awake or asleep.',
      keywords: ['world clock', 'current time', 'time around the world', 'world time', 'time in cities', 'international clock'],
      path: '/world-clock',
      noindex: Boolean(match.search.cities),
      jsonLd: [
        softwareAppSchema('World clock', '/world-clock', 'Live world clock for 700+ cities with daylight saving handled automatically.'),
        faqSchema(FAQ),
      ],
    }),
  component: WorldClockPage,
});

const phaseClass = { work: 'bg-festive-teal', edge: 'bg-festive-saffron/70', night: 'bg-muted-foreground/30' } as const;

function DayBar({ hour, minute }: { hour: number; minute: number }) {
  return (
    <div className="relative" aria-hidden>
      <div className="flex h-1.5 gap-px overflow-hidden rounded-full">
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className={cn('flex-1', phaseClass[dayPhase(h)])} />
        ))}
      </div>
      <span
        className="absolute -top-0.5 h-2.5 w-0.5 rounded-full bg-foreground"
        style={{ left: `${((hour * 60 + minute) / 1440) * 100}%` }}
      />
    </div>
  );
}

function ClockCard({ city, visitorOffset, onRemove, home }: { city: City; visitorOffset?: number; onRemove?: () => void; home?: boolean }) {
  const now = useNow(10_000);
  const parts = zonedParts(now, city.timeZone);
  const offset = offsetMinutes(now, city.timeZone);
  const country = countryNameOf(city);

  return (
    <div className={cn('relative space-y-3 rounded-2xl border bg-card p-4 shadow-xs', home && 'border-primary/40')}>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${city.name}`}
          className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="flex items-center gap-2 pr-6">
        {city.code ? (
          <CountryFlag countryCode={city.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
        ) : null}
        {city.code ? (
          <Link to="/time/$city" params={{ city: city.slug }} className="truncate font-semibold hover:text-primary hover:underline">
            {city.name}
          </Link>
        ) : (
          <span className="truncate font-semibold">{city.name}</span>
        )}
        {home && <Home className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Your location" />}
      </div>
      <div className="flex items-center justify-between gap-2">
        <LiveClock timeZone={city.timeZone} className="text-3xl font-bold tracking-tight" />
        <DayPhaseIcon hour={parts.hour} className="h-5 w-5" />
      </div>
      <DayBar hour={parts.hour} minute={parts.minute} />
      <p className="flex justify-between gap-2 text-xs text-muted-foreground" suppressHydrationWarning>
        <span>{formatShortDate(parts)}</span>
        <span>{visitorOffset === undefined || home ? formatOffset(offset) : formatDifference(offset - visitorOffset)}</span>
      </p>
      {country && <span className="sr-only">{country}</span>}
    </div>
  );
}

function WorldClockPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const hydrated = useHydrated();
  const now = useNow(60_000);

  const custom = parsePlaces(search.cities);
  const places = custom.length ? custom : parsePlaces(HUB_CITIES.join(','));

  const visitorZone = hydrated ? browserTimeZone() : undefined;
  const home = visitorZone ? cityForTimeZone(visitorZone) : undefined;
  const visitorOffset = visitorZone ? offsetMinutes(now, visitorZone) : undefined;

  const save = (next: City[]) =>
    navigate({ search: cleanSearch({ cities: next.map((c) => c.slug).join(',') }), replace: true, resetScroll: false });

  const shareUrl = `${SITE_URL}/world-clock${toQueryString({ cities: search.cities })}`;

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">World clock</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          The current time around the world, compared with yours. Add the cities you work with and share the list.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PlaceSelect addLabel="Add city" onChange={(c) => !places.some((p) => p.slug === c.slug) && save([...places, c])} />
        <CopyButton text={shareUrl} label="Copy link" />
        <HourFormatToggle className="ml-auto" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {home && !places.some((p) => p.slug === home.slug) && <ClockCard city={home} visitorOffset={visitorOffset} home />}
        {places.map((city) => (
          <ClockCard
            key={city.slug}
            city={city}
            visitorOffset={visitorOffset}
            home={city.slug === home?.slug}
            onRemove={places.length > 1 ? () => save(places.filter((p) => p.slug !== city.slug)) : undefined}
          />
        ))}
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Current time by city</h2>
        {citiesByRegion().map(({ region, cities }) => (
          <div key={region} className="space-y-2">
            <h3 className="font-semibold">{region}</h3>
            <div className="columns-2 gap-x-6 text-sm sm:columns-3 lg:columns-5">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  to="/time/$city"
                  params={{ city: city.slug }}
                  className="block truncate py-0.5 text-muted-foreground hover:text-primary"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
