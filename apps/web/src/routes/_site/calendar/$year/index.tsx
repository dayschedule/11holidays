import { useMemo, useRef } from 'react';
import { Link, createFileRoute, useHydrated, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar';
import { CalendarYearView } from '@/components/calendar/calendar-year-view';
import { HolidayLegend, YearGrid } from '@/components/calendar/year-grid';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { StatCard } from '@/components/time/time-ui';
import { Button } from '@/components/ui/button';
import { useToday } from '@/hooks/use-today';
import {
  calendarHolidays,
  MAX_YEAR,
  MIN_YEAR,
  MONTH_SLUGS,
  parseYear,
  yearCalendarSearch,
  yearFacts,
} from '@/lib/calendar-pages';
import { calendarThemes, generateYearCalendar, getMonthName } from '@/lib/calendar-utils';
import { getCountryByCode } from '@/lib/countries-data';
import { cleanSearch } from '@/lib/custom-calendar';
import { occasionParams } from '@/lib/holidays-api';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { faqSchema, seo, webPageSchema } from '@/lib/seo';
import { getVisitorCountry, useVisitorCountry } from '@/lib/visitor-country';
import { getWeekend, publicHolidayMap, summarizeYear } from '@/lib/workdays';
import { getCountryHolidays } from '@/server/holidays';

function faqFor(year: number) {
  const facts = yearFacts(year);
  return [
    {
      q: `Is ${year} a leap year?`,
      a: facts.leap
        ? `Yes. ${year} is a leap year with 366 days, and February has 29 days.`
        : `No. ${year} is a common year with 365 days, and February has 28 days.`,
    },
    {
      q: `How many weeks are in ${year}?`,
      a: `${year} has ${facts.isoWeeks} ISO weeks. It starts on a ${facts.jan1} and ends on a ${facts.dec31}.`,
    },
    {
      q: `How do I print the ${year} calendar?`,
      a: 'Press Print for your browser print dialog, or open Download for a ready-made PDF in A4 or US Letter. You can get the year on one page, one page per month, or both in one file.',
    },
    {
      q: 'Can I add public holidays to the calendar?',
      a: 'Yes. Choose a country and its public holidays are marked on the calendar and in every download. Choose Blank calendar for a version without holidays.',
    },
    {
      q: 'How do I share an event from my calendar?',
      a: 'Create an add to calendar link that works with Google Calendar, Outlook and Apple Calendar, then send it to your guests.',
      more: { label: 'Open the event link generator', href: dayscheduleUrl('/tools/event-link-generator') },
    },
  ];
}

export const Route = createFileRoute('/_site/calendar/$year/')({
  validateSearch: yearCalendarSearch,
  loaderDeps: ({ search }) => ({ country: search.country }),
  loader: async ({ params, deps }) => {
    const year = parseYear(params.year);
    const country = getCountryByCode(deps.country ?? getVisitorCountry()) ?? getCountryByCode('US')!;
    const { holidays } = await getCountryHolidays({ data: { code: country.code, year } });
    return { year, country, holidays };
  },
  headers: () => ({ 'Cache-Control': 'public, max-age=300, s-maxage=3600' }),
  head: ({ params, match }) => {
    const { year } = params;
    return seo({
      title: `Calendar ${year} - Free Printable ${year} Calendar with Holidays (PDF) | 11holidays`,
      description: `Free ${year} calendar with public holidays for 230+ countries. Download a printable ${year} calendar as PDF or PNG in A4 or Letter, with week numbers and all 12 months.`,
      keywords: [`calendar ${year}`, `${year} calendar`, `printable calendar ${year}`, `${year} calendar pdf`, `${year} calendar with holidays`, `yearly calendar ${year}`],
      path: `/calendar/${year}`,
      noindex: Object.keys(match.search).length > 0,
      jsonLd: [
        webPageSchema(`/calendar/${year}`, `Calendar ${year}`, `Printable ${year} calendar with public holidays.`),
        faqSchema(faqFor(Number(year))),
      ],
    });
  },
  component: YearCalendarPage,
});

function YearCalendarPage() {
  const { year, country, holidays } = Route.useLoaderData();
  const search = Route.useSearch();
  useVisitorCountry(country.code, !search.country);
  const navigate = useNavigate({ from: Route.fullPath });
  const hydrated = useHydrated();
  const today = useToday();
  const printRef = useRef<HTMLDivElement>(null);

  const weekStart = search.week === 'mon' ? 'mon' : 'sun';
  const theme = calendarThemes[search.theme ?? 'festive'];
  const selected = useMemo(() => calendarHolidays(holidays, search.show), [holidays, search.show]);
  const months = useMemo(() => generateYearCalendar(year, selected, weekStart, today), [year, selected, weekStart, today]);

  const facts = yearFacts(year);
  const workdays = useMemo(
    () =>
      summarizeYear(year, { weekend: getWeekend(country.code), holidays: publicHolidayMap(holidays) }).reduce(
        (sum, m) => sum + m.workingDays,
        0
      ),
    [year, country.code, holidays]
  );
  const publicHolidays = useMemo(() => calendarHolidays(holidays, undefined), [holidays]);

  const heading = search.show === 'none' ? 'Calendar' : `${country.name} Calendar`;
  const nearby = Array.from({ length: 7 }, (_, i) => year - 3 + i).filter((y) => y >= MIN_YEAR && y <= MAX_YEAR);

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-4">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: `Calendar ${year}` }]} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Calendar {year}</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              A printable {year} calendar with {country.name} public holidays. Download it as PDF or PNG, or pick any
              other country.
            </p>
          </div>
          <div className="no-print flex items-center gap-2">
            {year > MIN_YEAR && (
              <Button variant="outline" size="icon" asChild>
                <Link to="/calendar/$year" params={{ year: String(year - 1) }} search={search} aria-label={`Calendar ${year - 1}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <span className="w-14 text-center font-semibold tabular-nums">{year}</span>
            {year < MAX_YEAR && (
              <Button variant="outline" size="icon" asChild>
                <Link to="/calendar/$year" params={{ year: String(year + 1) }} search={search} aria-label={`Calendar ${year + 1}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <CalendarToolbar
        country={country}
        year={year}
        months={months}
        holidays={selected}
        search={search}
        printRef={printRef}
        heading={heading}
        fileBase={`calendar-${year}${search.show === 'none' ? '' : `-${country.code.toLowerCase()}`}`}
        onChange={(patch) =>
          navigate({ search: cleanSearch({ ...search, ...patch }), replace: true, resetScroll: false })
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Days" value={facts.days} hint={facts.leap ? 'Leap year' : 'Common year'} />
        <StatCard label="ISO weeks" value={facts.isoWeeks} hint={`Starts on a ${facts.jan1}`} />
        <StatCard label="Public holidays" value={publicHolidays.length} hint={country.name} />
        <StatCard label="Working days" value={publicHolidays.length ? workdays : '–'} hint={`In ${country.name}`} />
      </div>

      <div className="space-y-4">
        <HolidayLegend />
        <YearGrid
          year={year}
          holidays={selected}
          weekStart={weekStart}
          renderTitle={(month) => (
            <Link
              to="/calendar/$year/$month"
              params={{ year: String(year), month: MONTH_SLUGS[month]! }}
              search={search}
              className="hover:text-primary hover:underline"
            >
              {getMonthName(month)} <span className="text-muted-foreground">{year}</span>
            </Link>
          )}
        />
      </div>

      {publicHolidays.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">
            {country.name} public holidays {year}
          </h2>
          <ul className="grid gap-x-8 gap-y-1 rounded-2xl border bg-card p-4 text-sm shadow-xs sm:grid-cols-2">
            {publicHolidays.map((h) => (
              <li key={h.id} className="flex items-baseline gap-3 py-1">
                <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{format(parseISO(h.date), 'EEE, d MMM')}</span>
                {h.url ? (
                  <Link to="/holidays/$country/$slug" params={occasionParams(h.url)} className="hover:text-primary hover:underline">
                    {h.name}
                  </Link>
                ) : (
                  <span>{h.name}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Planning time off? See{' '}
            <Link to="/long-weekends/$country" params={{ country: country.slug! }} className="text-primary hover:underline">
              long weekends in {country.name}
            </Link>{' '}
            or use the{' '}
            <Link to="/leave-planner" className="text-primary hover:underline">
              leave planner
            </Link>
            . To add your own days off, open the{' '}
            <Link to="/calendars/$country" params={{ country: country.slug! }} className="text-primary hover:underline">
              calendar maker
            </Link>
            .
          </p>
        </section>
      ) : (
        <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground shadow-xs">
          We have no public holidays on record for {country.name} in {year}. The calendar and downloads still work.
        </p>
      )}

      <nav aria-label="Other years" className="no-print space-y-3">
        <h2 className="text-2xl font-bold">Calendars for other years</h2>
        <div className="flex flex-wrap gap-2">
          {nearby.map((y) => (
            <Button key={y} variant={y === year ? 'default' : 'outline'} size="sm" asChild>
              <Link to="/calendar/$year" params={{ year: String(y) }} search={search}>
                {y}
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      <FaqSection items={faqFor(year)} />

      {/* Off screen for PNG export and printing; the page itself shows the responsive grid */}
      {hydrated && (
        <div aria-hidden className="print-area pointer-events-none fixed -left-[9999px] top-0 w-[1000px]">
          <div ref={printRef}>
            <CalendarYearView months={months} year={year} theme={theme} heading={heading} weekStart={weekStart} />
          </div>
        </div>
      )}
    </PageLayout>
  );
}
