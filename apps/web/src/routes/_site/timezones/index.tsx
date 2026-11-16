import { useMemo, useState } from 'react';
import { Link, createFileRoute, useHydrated } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { HourFormatToggle } from '@/components/time/time-ui';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHour12, useNow } from '@/hooks/use-now';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { faqSchema, seo, webPageSchema } from '@/lib/seo';
import { formatClock, formatOffset, offsetMinutes, partsAtOffset } from '@/lib/time';
import { abbreviationAtOffset, getZone, ZONE_ABBREVIATIONS, ZONE_REGIONS, ZONES } from '@/lib/timezones';
import { cn } from '@/lib/utils';
import { CACHE, cacheHeaders } from '@/lib/cache';

const FAQ = [
  {
    q: 'How many time zones are there?',
    a: 'There are 38 UTC offsets in use around the world, from UTC-12:00 to UTC+14:00. The IANA time zone database splits these into several hundred named zones such as America/New_York, because regions with the same offset can follow different daylight saving rules.',
  },
  {
    q: 'What is the difference between UTC and GMT?',
    a: 'UTC is the atomic time standard that clocks worldwide are set from. GMT is a time zone used by the UK in winter and parts of West Africa all year. They show the same time, but UTC never changes for daylight saving and the UK moves to BST in summer.',
  },
  {
    q: 'Why use an IANA name instead of an abbreviation?',
    a: 'Abbreviations are ambiguous. IST can mean India, Israel or Irish Standard Time, and CST can mean US Central or China Standard Time. A name such as Asia/Kolkata identifies one zone and carries its full daylight saving history, which is why software uses it.',
  },
  {
    q: 'How do developers convert timestamps between zones?',
    a: 'Store times in UTC or as a Unix timestamp, and convert to a time zone only when you display them. DaySchedule has free converters for Unix, ISO 8601 and GMT timestamps.',
    more: { label: 'Open the Unix timestamp converter', href: dayscheduleUrl('/tools/unix-timestamp-convertor') },
  },
];

export const Route = createFileRoute('/_site/timezones/')({
  // Offsets the page is rendered with. The browser hydrates with these, then switches to its own:
  // browsers and the server can ship different time zone data (America/Winnipeg differed in 2026)
  loader: () => {
    const now = Date.now();
    return { offsets: Object.fromEntries(ZONES.map((z) => [z.name, offsetMinutes(now, z.name)])) };
  },
  head: () =>
    seo({
      title: 'Time Zones of the World - Current Time, UTC Offsets & Abbreviations | 11holidays',
      description:
        'Every IANA time zone with its current local time, UTC offset, abbreviation and main cities. Search by city or country and filter by continent.',
      keywords: ['time zones', 'world time zones', 'iana time zones', 'utc offsets', 'time zone list', 'time zone abbreviations'],
      path: '/timezones',
      jsonLd: [webPageSchema('/timezones', 'Time zones of the world', undefined, 'CollectionPage'), faqSchema(FAQ)],
    }),
  headers: () => cacheHeaders(CACHE.page),
  component: TimezonesPage,
});

function TimezonesPage() {
  const now = useNow(30_000);
  const hydrated = useHydrated();
  const { offsets } = Route.useLoaderData();
  const [hour12] = useHour12();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string>('All');

  // Offsets only change at DST boundaries, so one lookup per hour is plenty
  const hourKey = Math.floor(now.getTime() / 3_600_000);
  const sorted = useMemo(
    () =>
      ZONES.map((zone) => ({
        zone,
        offset: hydrated ? offsetMinutes(now, zone.name) : (offsets[zone.name] ?? offsetMinutes(now, zone.name)),
      })).sort(
        (a, b) => a.offset - b.offset || a.zone.name.localeCompare(b.zone.name)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hourKey, hydrated]
  );

  const q = query.trim().toLowerCase();
  const rows = sorted.filter(({ zone }) => {
    if (region !== 'All' && zone.continent !== region) return false;
    if (!q) return true;
    return [zone.name, zone.label, zone.countryName, zone.abbr, zone.dstAbbr, ...zone.cities]
      .some((text) => text.toLowerCase().includes(q));
  });

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Time zones of the world</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          The current time in all {ZONES.length} IANA time zones, with UTC offsets, abbreviations and main cities.
          Daylight saving is applied automatically.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, country or abbreviation…"
            aria-label="Search time zones"
            className="pl-9"
          />
        </div>
        <HourFormatToggle />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {['All', ...ZONE_REGIONS].map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={region === r}
            onClick={() => setRegion(r)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              region === r ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/40'
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time zone</TableHead>
              <TableHead className="hidden md:table-cell">Main cities</TableHead>
              <TableHead>Offset</TableHead>
              <TableHead className="hidden sm:table-cell">Abbr.</TableHead>
              <TableHead className="text-right">Time now</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ zone, offset }) => (
              <TableRow key={zone.name}>
                <TableCell className="whitespace-normal">
                  <Link to="/timezones/$zone" params={{ zone: zone.slug }} className="font-medium hover:text-primary hover:underline">
                    {zone.name.replace(/_/g, ' ')}
                  </Link>
                  <span className="block text-xs text-muted-foreground">{zone.label}</span>
                </TableCell>
                <TableCell className="hidden whitespace-normal text-muted-foreground md:table-cell">
                  {zone.cities.slice(0, 3).join(', ')}
                </TableCell>
                <TableCell className="tabular-nums">{formatOffset(offset)}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{abbreviationAtOffset(zone, offset) || '–'}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatClock(partsAtOffset(now, offset), hour12)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No time zone matches “{query}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Time zone abbreviations</h2>
        <div className="grid gap-x-8 rounded-2xl border bg-card p-4 text-sm shadow-xs sm:grid-cols-2">
          {ZONE_ABBREVIATIONS.map((a) => (
            <Link
              key={a.abbr}
              to="/timezones/$zone"
              params={{ zone: getZone(a.zone)!.slug }}
              className="flex items-baseline gap-3 py-1 hover:text-primary"
            >
              <span className="w-12 shrink-0 font-semibold">{a.abbr}</span>
              <span className="flex-1 text-muted-foreground">{a.name}</span>
              <span className="tabular-nums text-muted-foreground">{a.offset}</span>
            </Link>
          ))}
        </div>
      </section>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
