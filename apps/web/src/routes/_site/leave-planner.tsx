import { useMemo } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { Minus, Palmtree, Plus } from 'lucide-react';
import { z } from 'zod';
import { CountrySelect } from '@/components/country-select';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToday } from '@/hooks/use-today';
import { getCountryByCode } from '@/lib/countries-data';
import { faqSchema, seo, softwareAppSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { dayKind, getWeekend, planLeaves, publicHolidayMap, weekendLabel } from '@/lib/workdays';
import { getVisitorCountry, useVisitorCountry } from '@/lib/visitor-country';
import { getCountryHolidays } from '@/server/holidays';

const DEFAULT_LEAVES = 10;

/** From October on there is little left to plan this year, so default to next year */
function defaultYear(today = new Date()) {
  return today.getMonth() >= 9 ? today.getFullYear() + 1 : today.getFullYear();
}

const FAQ = [
  {
    q: 'How does the leave planner work?',
    a: 'It looks for working days between public holidays and weekends and finds the combination of breaks that gives you the most days off for the leave days you have.',
  },
  {
    q: 'How can I get the most days off with the fewest leaves?',
    a: 'Take leave on the working days that sit between a public holiday and a weekend. A Thursday holiday plus a Friday leave gives a 4-day weekend, and a few leaves around holiday weeks such as Christmas can turn into 9 or 10 days off.',
  },
  {
    q: 'Are regional holidays included?',
    a: "Only national public holidays are used, since they apply to most employees. Check your employer's holiday list for regional or company holidays.",
  },
  {
    q: 'Does it work for countries with a Friday–Saturday weekend?',
    a: "Yes. Each country uses its official weekend, for example Friday and Saturday in Saudi Arabia, so the suggested leave days fit the local work week.",
  },
];

export const Route = createFileRoute('/_site/leave-planner')({
  validateSearch: z.object({
    country: z.string().length(2).optional().catch(undefined),
    year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined),
    leaves: z.coerce.number().int().min(1).max(40).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ country: search.country, year: search.year ?? defaultYear() }),
  loader: async ({ deps }) => {
    const country = getCountryByCode(deps.country ?? getVisitorCountry()) ?? getCountryByCode('US')!;
    const { holidays } = await getCountryHolidays({ data: { code: country.code, year: deps.year } });
    return { country, year: deps.year, holidays };
  },
  head: () => {
    const year = defaultYear();
    return seo({
      title: `Leave Planner ${year} - Maximize Your Vacation Days Around Public Holidays | 11holidays`,
      description: `Turn a few leave days into long breaks. The free leave planner bridges public holidays and weekends to maximize your ${year} PTO and annual leave in 230+ countries.`,
      keywords: [
        'leave planner',
        `leave planner ${year}`,
        `how to maximize PTO ${year}`,
        'vacation planner',
        'annual leave optimizer',
        'holiday hacking',
      ],
      path: '/leave-planner',
      jsonLd: [
        softwareAppSchema('Leave planner', '/leave-planner', 'Plan leave days around public holidays and weekends to get the most days off.'),
        faqSchema(FAQ),
      ],
    });
  },
  component: LeavePlannerPage,
});

function LeavePlannerPage() {
  const { country, year, holidays } = Route.useLoaderData();
  const search = Route.useSearch();
  useVisitorCountry(country.code, !search.country);
  const navigate = useNavigate({ from: Route.fullPath });
  const leaves = search.leaves ?? DEFAULT_LEAVES;
  const today = useToday();
  const baseYear = defaultYear(today);
  const thisYear = today.getFullYear();

  const { ctx, breaks, daysOff, used, partial } = useMemo(() => {
    const ctx = { weekend: getWeekend(country.code), holidays: publicHolidayMap(holidays) };
    const from = year === today.getFullYear() ? today : new Date(year, 0, 1);
    const to = new Date(year, 11, 31);
    const breaks = from <= to ? planLeaves(from, to, leaves, ctx) : [];
    return {
      ctx,
      breaks,
      daysOff: breaks.reduce((t, b) => t + b.days, 0),
      used: breaks.reduce((t, b) => t + b.leaves.length, 0),
      partial: year === today.getFullYear(),
    };
  }, [country.code, holidays, year, leaves, today]);

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: { ...search, ...patch }, replace: true, resetScroll: false });

  return (
    <PageLayout country={country}>
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-festive-teal/15 px-3 py-1 text-xs font-semibold text-festive-teal">
          <Palmtree className="h-3.5 w-3.5" /> PTO optimizer · 230+ countries
        </span>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Leave planner {year}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Tell us how many leave days you have and we find the dates that give you the most time off by bridging public
          holidays and weekends.
        </p>
      </div>

      <section className="grid gap-5 rounded-2xl border bg-gradient-to-br from-festive-teal/15 via-festive-saffron/10 to-festive-coral/10 p-5 shadow-xs md:grid-cols-[260px_auto_1fr] md:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Country</Label>
          <CountrySelect value={country.code} onChange={(c) => update({ country: c.code.toLowerCase() })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Leave days</Label>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => update({ leaves: leaves - 1 })} disabled={leaves <= 1} aria-label="Fewer leaves">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center text-2xl font-bold tabular-nums">{leaves}</span>
            <Button size="icon" variant="outline" onClick={() => update({ leaves: leaves + 1 })} disabled={leaves >= 40} aria-label="More leaves">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Year</Label>
          <div className="flex gap-1">
            {[thisYear, thisYear + 1].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => update({ year: y === baseYear ? undefined : y })}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium',
                  y === year ? 'bg-primary text-primary-foreground' : 'border bg-card hover:bg-accent'
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <p className="text-lg sm:text-2xl md:col-span-3">
          Take <strong>{used}</strong> leave day{used === 1 ? '' : 's'} in {country.name} and enjoy{' '}
          <strong className="text-primary">{daysOff} days off</strong>
          {partial ? ` for the rest of ${year}` : ` in ${year}`}.
          {used < leaves && (
            <span className="block text-sm text-muted-foreground">
              {leaves - used} leave day{leaves - used === 1 ? '' : 's'} left over: no more holidays to bridge.
            </span>
          )}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Your best breaks</h2>
        {breaks.length === 0 && <p className="text-muted-foreground">No public holidays left to bridge in {year}.</p>}
        <div className="grid gap-3">
          {breaks.map((b) => (
            <div key={b.start} className="rounded-2xl border bg-card p-4 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{b.holidays.flatMap((h) => h.names).join(' + ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(b.start), 'EEE d MMM')} – {format(parseISO(b.end), 'EEE d MMM yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {b.leaves.length} leave{b.leaves.length === 1 ? '' : 's'}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-2xl font-bold">
                    <Palmtree className="h-5 w-5 text-festive-teal" />
                    {b.days}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {eachDayOfInterval({ start: parseISO(b.start), end: parseISO(b.end) }).map((d) => {
                  const kind = dayKind(d, ctx);
                  return (
                    <span
                      key={d.toISOString()}
                      title={kind === 'work' ? 'Take leave' : kind}
                      className={cn(
                        'flex w-10 flex-col items-center rounded-md py-1 text-[10px] leading-tight',
                        kind === 'work' && 'bg-primary text-primary-foreground',
                        kind === 'holiday' && 'bg-festive-saffron/30',
                        kind === 'weekend' && 'bg-muted'
                      )}
                    >
                      <span className="font-medium uppercase">{format(d, 'EEE')}</span>
                      <span className="text-sm font-bold">{format(d, 'd')}</span>
                    </span>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Take leave on {b.leaves.map((l) => format(parseISO(l), 'EEE d MMM')).join(', ')}.
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary" /> Leave day</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-festive-saffron/30" /> Public holiday</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-muted" /> Weekend ({weekendLabel(ctx.weekend)})</span>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        See all{' '}
        <Link to="/long-weekends/$country" params={{ country: country.slug! }} className="font-medium text-primary hover:underline">
          long weekends in {country.name}
        </Link>{' '}
        or count{' '}
        <Link to="/working-days-calculator" search={{ country: country.code.toLowerCase() }} className="font-medium text-primary hover:underline">
          working days
        </Link>
        .
      </p>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
