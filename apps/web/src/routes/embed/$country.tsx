import { useMemo } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { z } from 'zod';
import { CountryFlag } from '@/components/country-flag';
import { CalendarListView } from '@/components/calendar/calendar-list-view';
import { CalendarMonthView } from '@/components/calendar/calendar-month-view';
import { CalendarYearView } from '@/components/calendar/calendar-year-view';
import { calendarThemes, generateYearCalendar } from '@/lib/calendar-utils';
import { getCountryBySlug } from '@/lib/countries-data';
import { buildCalendarHolidays, calendarSearchSchema, toQueryString } from '@/lib/custom-calendar';
import { getHolidayTheme } from '@/lib/holiday-themes';
import { seo, SITE_URL } from '@/lib/seo';
import { getCountryHolidays } from '@/server/holidays';

const embedSearchSchema = calendarSearchSchema.extend({
  view: z.enum(['upcoming', 'list', 'month', 'year']).optional().catch(undefined),
  limit: z.coerce.number().int().min(1).max(30).optional().catch(undefined),
});

export const Route = createFileRoute('/embed/$country')({
  validateSearch: embedSearchSchema,
  loaderDeps: ({ search }) => ({ year: search.year ?? new Date().getFullYear(), view: search.view ?? 'upcoming' }),
  loader: async ({ params, deps }) => {
    const country = getCountryBySlug(params.country);
    if (!country) throw notFound();
    const { holidays } = await getCountryHolidays({ data: { code: country.code, year: deps.year } });

    // the upcoming list spills over into next year near the year end
    if (deps.view === 'upcoming' && deps.year === new Date().getFullYear()) {
      const next = await getCountryHolidays({ data: { code: country.code, year: deps.year + 1 } });
      return { country, year: deps.year, holidays: [...holidays, ...next.holidays] };
    }
    return { country, year: deps.year, holidays };
  },
  headers: () => ({ 'Cache-Control': 'public, max-age=900, s-maxage=3600' }),
  head: ({ loaderData }) =>
    seo({
      title: loaderData ? `${loaderData.country.name} holidays widget` : 'Holidays widget',
      noindex: true,
    }),
  component: EmbedPage,
});

function EmbedPage() {
  const { country, year, holidays } = Route.useLoaderData();
  const search = Route.useSearch();
  const view = search.view ?? 'upcoming';
  const theme = calendarThemes[search.theme ?? 'festive'];
  const weekStart = search.week ?? 'sun';
  const heading = search.title || `${country.name} Holidays`;

  const selected = useMemo(() => buildCalendarHolidays(holidays, search), [holidays, search]);
  const months = useMemo(() => generateYearCalendar(year, selected, weekStart), [year, selected, weekStart]);

  const fullUrl = `${SITE_URL}/calendars/${country.slug}${toQueryString({ ...search, view: view === 'upcoming' ? undefined : view, limit: undefined })}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background, color: theme.text }}>
      {view === 'upcoming' && (
        <UpcomingWidget
          heading={heading}
          countryCode={country.code}
          holidays={selected.filter((h) => h.date >= format(new Date(), 'yyyy-MM-dd')).slice(0, search.limit ?? 8)}
          theme={theme}
        />
      )}
      {view === 'year' && <CalendarYearView months={months} year={year} theme={theme} heading={heading} weekStart={weekStart} />}
      {view === 'month' && (
        <CalendarMonthView
          month={months[search.month ?? new Date().getMonth()]!}
          theme={theme}
          heading={heading}
          year={year}
          weekStart={weekStart}
        />
      )}
      {view === 'list' && <CalendarListView holidays={selected} theme={theme} heading={heading} year={year} />}

      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 pb-3 text-center text-[11px] hover:underline"
        style={{ color: theme.text, opacity: 0.6 }}
      >
        Powered by 11holidays.com
      </a>
    </div>
  );
}

function UpcomingWidget({
  heading,
  countryCode,
  holidays,
  theme,
}: {
  heading: string;
  countryCode: string;
  holidays: ReturnType<typeof buildCalendarHolidays>;
  theme: (typeof calendarThemes)[keyof typeof calendarThemes];
}) {
  return (
    <div className="p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div
        className="mb-3 flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: theme.primary, color: '#fff' }}
      >
        <CountryFlag countryCode={countryCode} className="h-5 w-7 rounded-sm shadow" />
        <div>
          <p className="text-base font-bold leading-tight">{heading}</p>
          <p className="text-xs opacity-80">Upcoming holidays</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {holidays.map((h) => {
          const date = parseISO(h.date);
          const days = differenceInCalendarDays(date, new Date());
          const emoji = getHolidayTheme(h.name, countryCode)?.particles[0];
          return (
            <li key={h.id} className="flex items-center gap-3 rounded-xl px-2 py-2" style={{ backgroundColor: theme.secondary }}>
              <div
                className="flex w-12 shrink-0 flex-col items-center rounded-lg py-1 text-white"
                style={{ backgroundColor: h.custom ? theme.custom : theme.holiday }}
              >
                <span className="text-[10px] font-semibold uppercase">{format(date, 'MMM')}</span>
                <span className="text-lg font-bold leading-none">{format(date, 'd')}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {emoji && <span className="mr-1">{emoji}</span>}
                  {h.name}
                </p>
                <p className="text-xs" style={{ opacity: 0.7 }}>
                  {format(date, 'EEEE')}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium" style={{ color: theme.primary }}>
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
              </span>
            </li>
          );
        })}
        {holidays.length === 0 && <li className="py-6 text-center text-sm opacity-70">No upcoming holidays</li>}
      </ul>
    </div>
  );
}
