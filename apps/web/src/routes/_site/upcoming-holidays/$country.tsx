import { notFound } from 'next/navigation';
import { fetchHolidays } from '@/lib/holidays-api';
import { getCountryBySlug } from '@/lib/countries-data';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { HolidaysTable } from '@/components/holidays-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  isToday,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/breadcrumb';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CountryFlag } from '@/components/country-flag';
import { PageLayout } from '@/components/page-layout';
import { fetchUpcomingOccasions } from '@/lib/occassion-api';
import { ArrowRight } from 'lucide-react';
import { OccasionsList } from '@/components/occasions-list';

interface PageProps {
  params: Promise<{
    country: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { country: countryParam } = await params;

  const country = getCountryBySlug(countryParam);
  if (!country) {
    return {
      title: 'Country Not Found',
    };
  }

  const year = new Date().getFullYear();
  return {
    title: `Upcoming Holidays in ${country.name} - 11holidays`,
    description: `Check today's and upcoming public holidays in ${country.name}. View the official ${year} ${country.name} holiday calendar, download holiday dates, and access ${country.code} public holiday data via API integration.`,
  };
}

export default async function UpcomingHolidayPage({ params }: PageProps) {
  const { country: countryParam } = await params;

  const country = getCountryBySlug(countryParam);
  if (!country) {
    notFound();
  }

  const { env } = getCloudflareContext();
  const year = new Date().getFullYear();
  const holidaysData = await fetchHolidays(env, country.code, year);
  const todayHolidays = holidaysData.holidays.filter((h) =>
    isToday(parseISO(h.date)),
  );

  const today = startOfDay(new Date());
  const threeMonthsLater = endOfDay(endOfMonth(addMonths(today, 3)));

  const upcomingHolidays = holidaysData.holidays.filter((h) => {
    const holidayDate = parseISO(h.date);

    return isWithinInterval(holidayDate, {
      start: today,
      end: threeMonthsLater,
    });
  });

  const upcomingOccasions = await fetchUpcomingOccasions(env, country.code, 4);
  const countryCode = country.code.toLowerCase();

  return (
    <PageLayout country={country}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Countries', href: '/countries' },
          { label: `Upcoming holidays in ${country.name}` },
        ]}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <CountryFlag
              countryCode={country.code}
              className="w-12 h-8 sm:w-16 sm:h-12 rounded"
            />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Upcoming Holidays in {country.name}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            List of upcoming holidays in {country.name} for year {year}
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Today&apos;s Holiday in {country.name}
          </CardTitle>
          <CardDescription>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayHolidays.length === 0 ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <p>No holiday in {country.name} today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayHolidays.map((h) => (
                <div
                  key={h.holiday_id}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-lg">{h.name}</p>
                  </div>
                  <Badge
                    variant={h.type === 'public' ? 'default' : 'secondary'}
                  >
                    {h.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <h2>
        Upcoming Holidays ({format(today, 'MMMM yyyy')} -{' '}
        {format(threeMonthsLater, 'MMMM yyyy')})
      </h2>

      <HolidaysTable
        holidays={upcomingHolidays}
        country={country}
        year={year}
        filter={false}
      />

      <section className="w-full mt-8 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Explore more holidays in {country.name}
          </h2>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/holidays/${countryCode}`}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <OccasionsList occasions={upcomingOccasions} />
      </section>
    </PageLayout>
  );
}
