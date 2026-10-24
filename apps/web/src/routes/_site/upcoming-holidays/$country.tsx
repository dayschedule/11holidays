import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { addMonths, endOfDay, endOfMonth, format, isSameDay, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { AdsBlock } from '@/components/ads-block';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryHeading } from '@/components/country-heading';
import { Countdown } from '@/components/festive';
import { HolidayTypeBadge } from '@/components/holiday-type-badge';
import { HolidaysTable } from '@/components/holidays-table';
import { OccasionsList } from '@/components/occasions-list';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { useToday } from '@/hooks/use-today';
import { getCountryBySlug } from '@/lib/countries-data';
import { getHolidayTheme } from '@/lib/holiday-themes';
import { holidayListSchema, seo } from '@/lib/seo';
import { getCountryHolidays, getUpcomingOccasions } from '@/server/holidays';

export const Route = createFileRoute('/_site/upcoming-holidays/$country')({
  loader: async ({ params }) => {
    const country = getCountryBySlug(params.country);
    if (!country) throw notFound();
    const year = new Date().getFullYear();
    const [thisYear, nextYear, occasions] = await Promise.all([
      getCountryHolidays({ data: { code: country.code, year } }),
      getCountryHolidays({ data: { code: country.code, year: year + 1 } }),
      getUpcomingOccasions({ data: { code: country.code, limit: 4 } }),
    ]);
    return { country, year, holidays: [...thisYear.holidays, ...nextYear.holidays], occasions };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? seo({
          title: `Upcoming Holidays in ${loaderData.country.name} - 11holidays`,
          description: `Is today a holiday in ${loaderData.country.name}? See today's and upcoming public holidays with a countdown, download holiday dates, and access ${loaderData.country.code} holiday data via API.`,
          path: `/upcoming-holidays/${params.country}`,
          jsonLd: [
            holidayListSchema(
              `Upcoming holidays in ${loaderData.country.name}`,
              loaderData.country.name,
              loaderData.holidays.filter((h) => h.date >= format(new Date(), 'yyyy-MM-dd')).slice(0, 10)
            ),
          ],
        })
      : {},
  component: UpcomingHolidayPage,
});

function UpcomingHolidayPage() {
  const { country, year, holidays, occasions } = Route.useLoaderData();

  const now = useToday();
  const isToday = (date: string) => isSameDay(parseISO(date), now);
  const todayHolidays = holidays.filter((h) => isToday(h.date));
  const today = startOfDay(now);
  const threeMonthsLater = endOfDay(endOfMonth(addMonths(today, 3)));
  const upcoming = holidays.filter((h) =>
    isWithinInterval(parseISO(h.date), { start: today, end: threeMonthsLater })
  );
  const next = upcoming.find((h) => !isToday(h.date));

  return (
    <PageLayout country={country}>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Countries', to: '/countries' },
          { label: `Upcoming holidays in ${country.name}` },
        ]}
      />

      <CountryHeading
        countryCode={country.code}
        title={`Upcoming Holidays in ${country.name}`}
        description={`Today's holiday and what's next in ${country.name}`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Today · {format(now, 'EEEE, MMMM d, yyyy')}
          </p>
          {todayHolidays.length === 0 ? (
            <p className="mt-2 text-lg font-semibold">No holiday in {country.name} today</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {todayHolidays.map((h) => (
                <li key={h.holiday_id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-lg font-semibold">
                    <PartyPopper className="h-5 w-5 text-primary" /> {h.name}
                  </span>
                  <HolidayTypeBadge type={h.type} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {next && (
          <section className="rounded-2xl border bg-gradient-to-br from-festive-coral/10 via-festive-saffron/10 to-festive-violet/10 p-5 shadow-xs">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Next holiday</p>
            <p className="mt-1 text-lg font-semibold">
              {getHolidayTheme(next.name, country.code)?.particles[0]} {next.name}
            </p>
            <p className="mb-3 text-sm text-muted-foreground">{format(parseISO(next.date), 'EEEE, MMMM d, yyyy')}</p>
            <Countdown date={next.date} variant="card" />
          </section>
        )}
      </div>

      <AdsBlock />

      <HolidaysTable
        holidays={upcoming}
        country={country}
        year={year}
        filter={false}
        title={`Upcoming holidays (${format(today, 'MMM yyyy')} – ${format(threeMonthsLater, 'MMM yyyy')})`}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Explore more holidays in {country.name}</h2>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to="/holidays/$country" params={{ country: country.code.toLowerCase() }}>
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <OccasionsList occasions={occasions} />
      </section>
    </PageLayout>
  );
}
