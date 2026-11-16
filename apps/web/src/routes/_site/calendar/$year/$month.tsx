import { useMemo, useRef } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, getISOWeek, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { CalendarMonthView } from '@/components/calendar/calendar-month-view';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar';
import { HolidayTypeBadge } from '@/components/holiday-type-badge';
import { PageLayout } from '@/components/page-layout';
import { StatCard } from '@/components/time/time-ui';
import { Button } from '@/components/ui/button';
import { useToday } from '@/hooks/use-today';
import { calendarHolidays, MAX_YEAR, MIN_YEAR, MONTH_SLUGS, parseMonth, parseYear, yearCalendarSearch } from '@/lib/calendar-pages';
import { calendarThemes, generateYearCalendar, getDaysInMonth, getMonthName } from '@/lib/calendar-utils';
import { getCountryByCode } from '@/lib/countries-data';
import { cleanSearch } from '@/lib/custom-calendar';
import { occasionParams } from '@/lib/holidays-api';
import { seo, webPageSchema } from '@/lib/seo';
import { getVisitorCountry, useVisitorCountry } from '@/lib/visitor-country';
import { getWeekend, publicHolidayMap, summarizeRange } from '@/lib/workdays';
import { getCountryHolidays } from '@/server/holidays';
import { CACHE, cacheHeaders } from '@/lib/cache';

export const Route = createFileRoute('/_site/calendar/$year/$month')({
  validateSearch: yearCalendarSearch,
  loaderDeps: ({ search }) => ({ country: search.country }),
  loader: async ({ params, deps }) => {
    const year = parseYear(params.year);
    const month = parseMonth(params.month);
    const country = getCountryByCode(deps.country ?? getVisitorCountry()) ?? getCountryByCode('US')!;
    const { holidays } = await getCountryHolidays({ data: { code: country.code, year } });
    return { year, month, country, holidays };
  },
  headers: () => cacheHeaders(CACHE.page),
  head: ({ params, match }) => {
    const name = params.month.charAt(0).toUpperCase() + params.month.slice(1).toLowerCase();
    const path = `/calendar/${params.year}/${params.month.toLowerCase()}`;
    return seo({
      title: `${name} ${params.year} Calendar with Holidays - Printable PDF | 11holidays`,
      description: `${name} ${params.year} calendar with public holidays, week numbers and working days. Print it or download a free PDF or PNG in A4 or Letter size.`,
      keywords: [`${name} ${params.year} calendar`, `calendar ${name} ${params.year}`, `${name} ${params.year} printable calendar`, `${name} ${params.year} holidays`],
      path,
      noindex: Object.keys(match.search).length > 0,
      jsonLd: [webPageSchema(path, `${name} ${params.year} calendar`)],
    });
  },
  component: MonthCalendarPage,
});

function MonthCalendarPage() {
  const { year, month, country, holidays } = Route.useLoaderData();
  const search = Route.useSearch();
  useVisitorCountry(country.code, !search.country);
  const navigate = useNavigate({ from: Route.fullPath });
  const today = useToday();
  const printRef = useRef<HTMLDivElement>(null);

  const weekStart = search.week === 'mon' ? 'mon' : 'sun';
  const theme = calendarThemes[search.theme ?? 'festive'];
  const name = getMonthName(month);
  const selected = useMemo(() => calendarHolidays(holidays, search.show), [holidays, search.show]);
  const calendar = useMemo(
    () => generateYearCalendar(year, selected, weekStart, today)[month]!,
    [year, month, selected, weekStart, today]
  );
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthHolidays = selected.filter((h) => h.date.startsWith(monthKey));

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month, getDaysInMonth(year, month));
  const summary = summarizeRange(firstDay, lastDay, {
    weekend: getWeekend(country.code),
    holidays: publicHolidayMap(holidays),
  });

  const previous = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
  const heading = search.show === 'none' ? '' : country.name;

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: `Calendar ${year}`, to: '/calendar/$year', params: { year: String(year) } },
            { label: name },
          ]}
        />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              {name} {year} calendar
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {name} {year} has {lastDay.getDate()} days, starts on a {format(firstDay, 'EEEE')} and ends on a{' '}
              {format(lastDay, 'EEEE')}.
            </p>
          </div>
          <div className="no-print flex items-center gap-2">
            {previous.year >= MIN_YEAR && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/calendar/$year/$month" params={{ year: String(previous.year), month: MONTH_SLUGS[previous.month]! }} search={search}>
                  <ChevronLeft className="h-4 w-4" /> {getMonthName(previous.month).slice(0, 3)}
                </Link>
              </Button>
            )}
            {next.year <= MAX_YEAR && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/calendar/$year/$month" params={{ year: String(next.year), month: MONTH_SLUGS[next.month]! }} search={search}>
                  {getMonthName(next.month).slice(0, 3)} <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <CalendarToolbar
        country={country}
        year={year}
        months={[calendar]}
        holidays={monthHolidays}
        search={search}
        printRef={printRef}
        heading={heading}
        fileBase={`calendar-${MONTH_SLUGS[month]}-${year}${search.show === 'none' ? '' : `-${country.code.toLowerCase()}`}`}
        onChange={(patch) =>
          navigate({ search: cleanSearch({ ...search, ...patch }), replace: true, resetScroll: false })
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Working days" value={summary.workingDays} hint={`In ${country.name}`} />
        <StatCard label="Weekend days" value={summary.weekendDays} />
        <StatCard label="Public holidays" value={summary.holidayDays} hint="On a working day" />
        <StatCard label="ISO weeks" value={`${getISOWeek(firstDay)}–${getISOWeek(lastDay)}`} />
      </div>

      <div className="print-area overflow-auto rounded-2xl border shadow-xs">
        <div ref={printRef}>
          <CalendarMonthView month={calendar} theme={theme} heading={heading} year={year} weekStart={weekStart} />
        </div>
      </div>

      {monthHolidays.length > 0 && (
        <section className="no-print space-y-4">
          <h2 className="text-2xl font-bold">
            Holidays in {name} {year}
          </h2>
          <ul className="divide-y rounded-2xl border bg-card shadow-xs">
            {monthHolidays.map((h) => (
              <li key={h.id} className="flex items-center gap-3 p-3 text-sm">
                <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{format(parseISO(h.date), 'EEE, d MMM')}</span>
                {h.url ? (
                  <Link to="/holidays/$country/$slug" params={occasionParams(h.url)} className="flex-1 font-medium hover:text-primary hover:underline">
                    {h.name}
                  </Link>
                ) : (
                  <span className="flex-1 font-medium">{h.name}</span>
                )}
                <HolidayTypeBadge type={h.type} className="text-[10px]" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label={`Months of ${year}`} className="no-print space-y-3">
        <h2 className="text-2xl font-bold">All months of {year}</h2>
        <div className="flex flex-wrap gap-2">
          {MONTH_SLUGS.map((slug, m) => (
            <Button key={slug} variant={m === month ? 'default' : 'outline'} size="sm" asChild>
              <Link to="/calendar/$year/$month" params={{ year: String(year), month: slug }} search={search}>
                {getMonthName(m).slice(0, 3)}
              </Link>
            </Button>
          ))}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/calendar/$year" params={{ year: String(year) }} search={search}>
              Full year
            </Link>
          </Button>
        </div>
      </nav>
    </PageLayout>
  );
}
