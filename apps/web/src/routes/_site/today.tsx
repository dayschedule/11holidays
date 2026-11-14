import { useEffect, useMemo } from 'react';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { differenceInCalendarDays, format, getDayOfYear, getISOWeek, getQuarter, isLeapYear } from 'date-fns';
import { CountryFlag } from '@/components/country-flag';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { StatCard } from '@/components/time/time-ui';
import { useToday } from '@/hooks/use-today';
import { getCountryName } from '@/lib/countries-data';
import { holidayKind, occasionParams, type HolidaySearchResult } from '@/lib/holidays-api';
import { faqSchema, seo, webPageSchema } from '@/lib/seo';
import { getHolidaysOnDate } from '@/server/holidays';
import { CACHE, cacheHeaders } from '@/lib/cache';

const FAQ = [
  {
    q: 'What day of the year is it?',
    a: 'The day number at the top of this page counts from 1 January as day 1, and it follows the date on your device.',
  },
  {
    q: 'What holidays are celebrated today?',
    a: 'This page lists the public holidays and observances on today’s date in every country we cover. Holidays that fall in more countries are listed first.',
  },
];

// Local date on the visitor's device; on the server this is the UTC date
const localDate = () => format(new Date(), 'yyyy-MM-dd');

export const Route = createFileRoute('/_site/today')({
  loader: async () => {
    const date = localDate();
    return { date, holidays: await getHolidaysOnDate({ data: { date } }) };
  },
  headers: () => cacheHeaders(CACHE.daily),
  head: () =>
    seo({
      title: `What Day Is It Today? Today's Date, Week Number & Holidays | 11holidays`,
      description:
        "Today's date, day of the year, week number and quarter, with every public holiday and observance happening today around the world.",
      keywords: ['what day is it today', "today's date", 'what is today', 'day of the year', 'holidays today', 'what holiday is today'],
      path: '/today',
      jsonLd: [webPageSchema('/today', "Today's date and holidays"), faqSchema(FAQ)],
    }),
  component: TodayPage,
});

interface HolidayGroup {
  name: string;
  url: string | null;
  isPublic: boolean;
  countries: string[];
}

/** The same holiday appears once per country, so show it once with all its countries */
function groupHolidays(holidays: HolidaySearchResult[]): HolidayGroup[] {
  const groups = new Map<string, HolidayGroup>();
  for (const h of holidays) {
    const group = groups.get(h.name) ?? { name: h.name, url: h.url, isPublic: false, countries: [] };
    if (!group.countries.includes(h.country)) group.countries.push(h.country);
    group.isPublic ||= holidayKind(h.type) === 'public';
    group.url ??= h.url;
    groups.set(h.name, group);
  }
  return [...groups.values()].sort(
    (a, b) => Number(b.isPublic) - Number(a.isPublic) || b.countries.length - a.countries.length
  );
}

function TodayPage() {
  const { date, holidays } = Route.useLoaderData();
  const router = useRouter();
  const today = useToday();

  // The page is rendered for the UTC date; reload the holidays if the visitor's day is different
  useEffect(() => {
    if (localDate() !== date) router.invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => groupHolidays(holidays), [holidays]);
  const year = today.getFullYear();
  const daysInYear = isLeapYear(today) ? 366 : 365;
  const dayOfYear = getDayOfYear(today);

  return (
    <PageLayout sidebar={false}>
      <section className="rounded-3xl border bg-card p-6 text-center shadow-xs sm:p-10">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Today is</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-6xl">{format(today, 'EEEE')}</h1>
        <p className="mt-2 text-xl text-muted-foreground sm:text-2xl">{format(today, 'd MMMM yyyy')}</p>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Day of the year" value={dayOfYear} hint={`of ${daysInYear}`} />
        <StatCard label="Week number" value={<Link to="/week-number" className="hover:text-primary hover:underline">{getISOWeek(today)}</Link>} hint="ISO 8601" />
        <StatCard label="Quarter" value={`Q${getQuarter(today)}`} />
        <StatCard
          label="Days left"
          value={<Link to="/year-progress" className="hover:text-primary hover:underline">{differenceInCalendarDays(new Date(year, 11, 31), today)}</Link>}
          hint={`In ${year}`}
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Holidays around the world today</h2>
        {groups.length > 0 ? (
          <ul className="divide-y rounded-2xl border bg-card shadow-xs">
            {groups.map((g) => (
              <li key={g.name} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
                {g.url ? (
                  <Link to="/holidays/$country/$slug" params={occasionParams(g.url)} className="font-medium hover:text-primary hover:underline">
                    {g.name}
                  </Link>
                ) : (
                  <span className="font-medium">{g.name}</span>
                )}
                <span className="flex flex-wrap items-center gap-1">
                  {g.countries.slice(0, 8).map((code) => (
                    <span key={code} title={getCountryName(code)}>
                      <CountryFlag countryCode={code} className="h-3.5 w-5 rounded-[2px]" />
                    </span>
                  ))}
                  {g.countries.length > 8 && <span className="text-xs text-muted-foreground">+{g.countries.length - 8}</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground shadow-xs">
            No holidays on record today. See{' '}
            <Link to="/holidays" className="text-primary hover:underline">upcoming holidays</Link>.
          </p>
        )}
      </section>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
