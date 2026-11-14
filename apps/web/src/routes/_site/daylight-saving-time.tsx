import { Link, createFileRoute } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import { z } from 'zod';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNow } from '@/hooks/use-now';
import { currentYear } from '@/lib/holidays-api';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { faqSchema, seo, webPageSchema } from '@/lib/seo';
import { formatClock, formatDuration, formatOffset, formatShortDate, offsetChanges, zonedParts, type OffsetChange } from '@/lib/time';
import { getZone } from '@/lib/timezones';
import { CACHE, cacheHeaders } from '@/lib/cache';

/** One zone per set of rules people ask about */
const REGIONS: { region: string; zones: { label: string; zone: string }[] }[] = [
  {
    region: 'North America',
    zones: [
      { label: 'New York', zone: 'America/New_York' },
      { label: 'Chicago', zone: 'America/Chicago' },
      { label: 'Denver', zone: 'America/Denver' },
      { label: 'Los Angeles', zone: 'America/Los_Angeles' },
      { label: 'Anchorage', zone: 'America/Anchorage' },
      { label: 'Toronto', zone: 'America/Toronto' },
      { label: 'Havana', zone: 'America/Havana' },
    ],
  },
  {
    region: 'Europe',
    zones: [
      { label: 'London', zone: 'Europe/London' },
      { label: 'Dublin', zone: 'Europe/Dublin' },
      { label: 'Paris', zone: 'Europe/Paris' },
      { label: 'Berlin', zone: 'Europe/Berlin' },
      { label: 'Athens', zone: 'Europe/Athens' },
    ],
  },
  {
    region: 'Southern Hemisphere',
    zones: [
      { label: 'Sydney', zone: 'Australia/Sydney' },
      { label: 'Adelaide', zone: 'Australia/Adelaide' },
      { label: 'Auckland', zone: 'Pacific/Auckland' },
      { label: 'Santiago', zone: 'America/Santiago' },
    ],
  },
  {
    region: 'Middle East',
    zones: [
      { label: 'Jerusalem', zone: 'Asia/Jerusalem' },
      { label: 'Beirut', zone: 'Asia/Beirut' },
    ],
  },
];

function faqFor(year: number) {
  return [
    {
      q: `When do the clocks change in ${year}?`,
      a: 'It depends on where you are. The US and Canada change on the second Sunday of March and the first Sunday of November. The EU and UK change on the last Sunday of March and the last Sunday of October. The table on this page has the exact dates.',
    },
    {
      q: 'Which way do clocks go?',
      a: 'Clocks go forward one hour in spring, so you lose an hour of sleep, and back one hour in autumn, so you gain one. In the Southern Hemisphere spring falls in September and October.',
    },
    {
      q: 'Which countries do not use daylight saving time?',
      a: 'Most of Africa and Asia keep the same time all year, including India, China and Japan, and so do most countries near the equator. In the US, Hawaii and most of Arizona also stay on standard time.',
    },
    {
      q: 'How do I keep meetings right when the clocks change?',
      a: 'Set your working hours in a named time zone such as America/New_York rather than a fixed UTC offset, so they follow the local clock. Schedules in DaySchedule work this way.',
      more: { label: 'Read about availability schedules', href: dayscheduleUrl('/docs/availability-schedules') },
    },
  ];
}

export const Route = createFileRoute('/_site/daylight-saving-time')({
  validateSearch: z.object({ year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined) }),
  headers: () => cacheHeaders(CACHE.page),
  head: ({ match }) => {
    const year = match.search.year ?? currentYear();
    return seo({
      title: `Daylight Saving Time ${year} - When Do Clocks Change? | 11holidays`,
      description: `Exact daylight saving time dates for ${year} in the US, Canada, UK, Europe, Australia and New Zealand. See when the clocks go forward and back.`,
      keywords: [`daylight saving time ${year}`, `when do clocks change ${year}`, `dst ${year}`, `clocks go back ${year}`, `clocks go forward ${year}`],
      path: '/daylight-saving-time',
      noindex: Boolean(match.search.year),
      jsonLd: [webPageSchema('/daylight-saving-time', `Daylight saving time ${year}`), faqSchema(faqFor(year))],
    });
  },
  component: DaylightSavingPage,
});

/** Wall clock just before a change, which is the time people quote: "at 2:00 AM" */
function changeLabel(change: OffsetChange, timeZone: string) {
  const local = zonedParts(change.at, timeZone);
  const before = new Date(change.at.getTime() + change.from * 60_000);
  return `${formatShortDate(local)}, ${formatClock({ hour: before.getUTCHours(), minute: before.getUTCMinutes(), second: 0 })}`;
}

function DaylightSavingPage() {
  const search = Route.useSearch();
  const now = useNow(60_000);
  const year = search.year ?? now.getUTCFullYear();

  const regions = REGIONS.map(({ region, zones }) => ({
    region,
    rows: zones.map(({ label, zone }) => {
      const changes = offsetChanges(zone, year);
      return {
        label,
        zone,
        forward: changes.find((c) => c.to > c.from),
        back: changes.find((c) => c.to < c.from),
      };
    }),
  }));

  const upcoming = regions
    .flatMap((r) => r.rows)
    .flatMap((row) => [row.forward, row.back].flatMap((c) => (c && c.at > now ? [{ ...row, change: c }] : [])))
    .sort((a, b) => a.change.at.getTime() - b.change.at.getTime())[0];

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Daylight saving time {year}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          The exact dates the clocks change in {year}, calculated from the IANA time zone rules.
        </p>
      </div>

      {upcoming && (
        <section className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs">
          <Clock className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm">
            <strong>Next change:</strong> clocks go {upcoming.change.to > upcoming.change.from ? 'forward' : 'back'}{' '}
            {formatDuration(upcoming.change.to - upcoming.change.from)} in {upcoming.label} on{' '}
            {changeLabel(upcoming.change, upcoming.zone)} local time.
          </p>
        </section>
      )}

      {regions.map(({ region, rows }) => (
        <section key={region} className="space-y-3">
          <h2 className="text-2xl font-bold">{region}</h2>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Clocks go forward</TableHead>
                  <TableHead>Clocks go back</TableHead>
                  <TableHead className="hidden sm:table-cell">Offsets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const zone = getZone(row.zone);
                  return (
                    <TableRow key={row.zone}>
                      <TableCell className="font-medium">
                        {zone ? (
                          <Link to="/timezones/$zone" params={{ zone: zone.slug }} className="hover:text-primary hover:underline">
                            {row.label}
                          </Link>
                        ) : (
                          row.label
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{row.forward ? changeLabel(row.forward, row.zone) : '–'}</TableCell>
                      <TableCell className="tabular-nums">{row.back ? changeLabel(row.back, row.zone) : '–'}</TableCell>
                      <TableCell className="hidden tabular-nums text-muted-foreground sm:table-cell">
                        {row.forward ? `${formatOffset(row.forward.from)} / ${formatOffset(row.forward.to)}` : '–'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}

      <nav aria-label="Other years" className="flex flex-wrap gap-2">
        {[year - 1, year, year + 1, year + 2].map((y) => (
          <Button key={y} size="sm" variant={y === year ? 'default' : 'outline'} asChild>
            <Link to="/daylight-saving-time" search={{ year: y }}>
              {y}
            </Link>
          </Button>
        ))}
      </nav>

      <FaqSection items={faqFor(year)} />
    </PageLayout>
  );
}
