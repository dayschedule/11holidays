import { notFound } from 'next/navigation';
import { fetchHolidays } from '@/lib/holidays-api';
import { getCountryBySlug } from '@/lib/countries-data';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { HolidaysTable } from '@/components/holidays-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CountryFlag } from '@/components/country-flag';

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

export default async function HolidayPage({ params }: PageProps) {
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

  return (
    <div className="container">
      <div className="mx-auto space-y-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Countries', href: '/countries' },
            { label: `Upcoming holidays in ${country.name}` },
          ]}
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-9 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <CountryFlag
                    countryCode={country.code}
                    className="w-16 h-12 rounded"
                  />
                  <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
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
              </CardHeader>
              <CardContent>
                {todayHolidays.length === 0 ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <p>
                      No holiday in {country.name} today -{' '}
                      {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </p>
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
                          <p className="text-sm text-muted-foreground">
                            {h.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            h.type === 'public' ? 'default' : 'secondary'
                          }
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
            />
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/holidays/${country.code.toLowerCase()}/${year}`}>
                See all holidays in {year} &rarr;
              </Link>
            </Button>
          </div>
          <div className="lg:col-span-3">
            <Card className="sticky top-20 border-dashed">
              <CardContent>
                <div className="flex flex-col items-center justify-center text-center">
                  <Badge variant="outline" className="text-xs mb-4">
                    Ads
                  </Badge>
                  <Image
                    src="/img/dayschedule.svg"
                    alt="DaySchedule"
                    className="mb-4"
                    width={180}
                    height={40}
                  />
                  <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                    Create your free appointment booking page
                  </p>
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Easy online booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Automated reminders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Client management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Free forever</span>
                    </div>
                  </div>
                  <Button className="w-full max-w-xs" asChild>
                    <Link
                      href="https://dayschedule.com/?utm_source=11holidays"
                      target="_blank"
                      rel="nofollow noindex"
                    >
                      Create Appointment Page
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
