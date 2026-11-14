import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Clock, X } from 'lucide-react';
import { z } from 'zod';
import { CopyButton } from '@/components/countdown-tools';
import { CountryFlag } from '@/components/country-flag';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { PlaceSelect } from '@/components/time/place-select';
import { DayPhaseIcon, HourFormatToggle } from '@/components/time/time-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHour12, useNow } from '@/hooks/use-now';
import { getPlace, parsePlaces, type City } from '@/lib/cities';
import { cleanSearch, toQueryString } from '@/lib/custom-calendar';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { faqSchema, seo, SITE_URL, softwareAppSchema } from '@/lib/seo';
import {
  dayDifference,
  formatClock,
  formatDifference,
  formatLongDate,
  formatOffset,
  formatShortDate,
  isoDate,
  offsetMinutes,
  zonedParts,
  zonedToUtc,
} from '@/lib/time';

const FAQ = [
  {
    q: 'How do I convert time between time zones?',
    a: 'Pick the city the time is in, set the date and time, and add the cities you want to compare. The local time in each city updates immediately, including whether it falls on the next or previous day.',
  },
  {
    q: 'Why does the date matter when converting time?',
    a: 'Daylight saving changes the difference between cities during the year. New York and London are usually 5 hours apart, but for a few weeks each year the gap is 4 hours because the US and UK change their clocks on different dates.',
  },
  {
    q: 'Can I share a converted time?',
    a: 'Yes. Copy link saves the cities, date and time in the address, so whoever opens it sees the same time converted for the same places.',
  },
  {
    q: 'How do I find a time that suits everyone?',
    a: 'Converting one time at a time is slow with a larger group. The free meeting planner on DaySchedule shows the working hours of every city side by side.',
    more: { label: 'Open the meeting planner', href: dayscheduleUrl('/tools/meeting-planner') },
  },
  {
    q: 'How do I calculate the time between two dates and times?',
    a: 'The time difference calculator on DaySchedule gives the exact gap in days, hours and minutes.',
    more: { label: 'Open the time difference calculator', href: dayscheduleUrl('/tools/time-difference-calculator') },
  },
];

const DEFAULT_FROM = 'new-york';
const DEFAULT_TO = 'london,dubai,mumbai,tokyo,sydney';
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const Route = createFileRoute('/_site/time-zone-converter')({
  validateSearch: z.object({
    from: z.string().max(60).optional().catch(undefined),
    to: z.string().max(400).optional().catch(undefined),
    at: z.string().regex(DATE_TIME).optional().catch(undefined),
  }),
  headers: () => ({ 'Cache-Control': 'public, max-age=300, s-maxage=3600' }),
  head: ({ match }) =>
    seo({
      title: 'Time Zone Converter - Convert Time Between Cities | 11holidays',
      description:
        'Free time zone converter for 700+ cities. Convert any date and time between time zones, with daylight saving handled automatically, and share the result with a link.',
      keywords: ['time zone converter', 'time converter', 'convert time zones', 'est to ist', 'pst to est', 'utc converter'],
      path: '/time-zone-converter',
      noindex: Object.keys(match.search).length > 0,
      jsonLd: [
        softwareAppSchema('Time zone converter', '/time-zone-converter', 'Convert any date and time between 700+ cities and time zones.'),
        faqSchema(FAQ),
      ],
    }),
  component: ConverterPage,
});

function ConverterPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const now = useNow(30_000);
  const [hour12] = useHour12();

  const from = getPlace(search.from ?? DEFAULT_FROM) ?? getPlace(DEFAULT_FROM)!;
  const targets = parsePlaces(search.to ?? DEFAULT_TO).filter((c) => c.slug !== from.slug);

  // Until a time is chosen, this follows the current time in the source city
  const live = zonedParts(now, from.timeZone);
  const at = search.at ?? `${isoDate(live)}T${String(live.hour).padStart(2, '0')}:${String(live.minute).padStart(2, '0')}`;
  const [date = '', time = ''] = at.split('T');
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const [hour, minute] = time.split(':').map(Number) as [number, number];

  const instant = zonedToUtc(year, month, day, hour, minute, from.timeZone);
  const source = zonedParts(instant, from.timeZone);
  const sourceOffset = offsetMinutes(instant, from.timeZone);

  const update = (patch: { from?: string; to?: string; at?: string }) =>
    navigate({ search: cleanSearch({ ...search, ...patch }), replace: true, resetScroll: false });

  const setClock = (minutes: number) =>
    update({
      at: `${date}T${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
    });

  const addTarget = (city: City) => {
    if (city.slug === from.slug || targets.some((t) => t.slug === city.slug)) return;
    update({ to: [...targets, city].map((t) => t.slug).join(',') });
  };

  const shareUrl = `${SITE_URL}/time-zone-converter${toQueryString({ from: from.slug, to: targets.map((t) => t.slug).join(','), at })}`;

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Time zone converter</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Convert a date and time between cities, with daylight saving applied for that exact date.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4 self-start rounded-2xl border bg-card p-4 shadow-xs lg:sticky lg:top-24">
          <div className="space-y-1.5">
            <Label htmlFor="tz-from" className="text-xs">Time in</Label>
            <PlaceSelect id="tz-from" value={from.slug} onChange={(c) => update({ from: c.slug })} />
          </div>
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="tz-date" className="text-xs">Date</Label>
              <Input
                id="tz-date"
                type="date"
                value={date}
                onChange={(e) => e.target.value && update({ at: `${e.target.value}T${time}` })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz-time" className="text-xs">Time</Label>
              <Input
                id="tz-time"
                type="time"
                value={time}
                onChange={(e) => e.target.value && update({ at: `${date}T${e.target.value}` })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tz-slider" className="text-xs">Slide through the day</Label>
            <input
              id="tz-slider"
              type="range"
              min={0}
              max={1425}
              step={15}
              value={hour * 60 + minute}
              onChange={(e) => setClock(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => update({ at: undefined })}>
              <Clock className="h-4 w-4" /> Now
            </Button>
            <CopyButton text={shareUrl} label="Copy link" />
            <HourFormatToggle className="ml-auto" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-primary/40 bg-card p-4 shadow-xs">
            <p className="text-sm font-semibold">{from.name}</p>
            <p className="text-4xl font-bold tabular-nums tracking-tight" suppressHydrationWarning>
              {formatClock(source, hour12)}
            </p>
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {formatLongDate(source)} · {formatOffset(sourceOffset)}
            </p>
          </div>

          <ul className="divide-y rounded-2xl border bg-card shadow-xs">
            {targets.map((city) => {
              const local = zonedParts(instant, city.timeZone);
              const shift = dayDifference(source, local);
              return (
                <li key={city.slug} className="flex items-center gap-3 p-3">
                  {city.code ? (
                    <CountryFlag countryCode={city.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                  ) : (
                    <span className="w-5" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{city.name}</span>
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {formatDifference(offsetMinutes(instant, city.timeZone) - sourceOffset)} · {formatOffset(offsetMinutes(instant, city.timeZone))}
                    </span>
                  </span>
                  <DayPhaseIcon hour={local.hour} />
                  <span className="w-28 text-right" suppressHydrationWarning>
                    <span className="block text-lg font-bold tabular-nums">{formatClock(local, hour12)}</span>
                    <span className="text-xs text-muted-foreground">
                      {shift === 0 ? formatShortDate(local) : `${formatShortDate(local)} (${shift > 0 ? '+' : ''}${shift}d)`}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${city.name}`}
                    onClick={() => update({ to: targets.filter((t) => t.slug !== city.slug).map((t) => t.slug).join(',') || 'utc' })}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
          <PlaceSelect addLabel="Add city" onChange={addTarget} />
        </div>
      </div>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
