import { notFound } from 'next/navigation';
import { fetchHolidays } from '@/lib/holidays-api';
import { getCountryBySlug } from '@/lib/countries-data';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/breadcrumb';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateLongWeekends } from '@/lib/long-weekends';
import { CountryFlag } from '@/components/country-flag';
import { LongWeekendsTable } from '@/components/long-weekends-table';
import { PageLayout } from '@/components/page-layout';
import { OccasionsList } from '../../../components/occasions-list';
import { ArrowRight } from 'lucide-react';
import { fetchUpcomingOccasions } from '../../../lib/occassion-api';

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
    title: `Long Weekends in ${year} - ${country.name} | 11holidays`,
    description: `List of long weekends in ${country.name} for ${year}. Plan your trips with extended weekends, view detailed holiday breakdowns and long weekend calendars.`,
  };
}

export default async function LongWeekendsPage({ params }: PageProps) {
  const { country: countryParam } = await params;

  const country = getCountryBySlug(countryParam);
  if (!country) {
    notFound();
  }

  const { env } = getCloudflareContext();
  const year = new Date().getFullYear();
  const holidaysData = await fetchHolidays(env, country.code, year);

  const today = startOfDay(new Date());
  const longWeekends = generateLongWeekends(holidaysData.holidays);

  const upcoming = longWeekends
    .filter((lw) => isAfter(parseISO(lw.endDate), today))
    .slice(0, 5);

  const upcomingOccasions = await fetchUpcomingOccasions(env, country.code, 4);
  const countryCode = country.code.toLowerCase();

  return (
    <PageLayout country={country}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Countries', href: '/countries' },
          { label: `Long Weekends in ${year} ${country.name}` },
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
              Long Weekends in {year} {country.name}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            List of long Weekends in {country.name} for year {year}
          </p>
        </div>
      </div>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Upcoming Long Weekends in {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming long weekends found.
              </p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((lw) => (
                  <li key={lw.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <span className="font-medium">{lw.occasion}</span>
                      <span className="text-muted-foreground">
                        {' — '}
                        {format(parseISO(lw.startDate), 'd MMM')} –{' '}
                        {format(parseISO(lw.endDate), 'd MMM yyyy')}
                      </span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {lw.days} days
                      </Badge>
                      {lw.leavesNeeded > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
                          {lw.leavesNeeded} leave
                          {lw.leavesNeeded > 1 ? 's' : ''}
                        </span>
                      )}
                      {lw.tip && (
                        <p className="text-muted-foreground mt-0.5">{lw.tip}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Long Weekends in {year} {country.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Month-wise list of long weekends in {year} {country.name}, showing
            dates, total days off, and the holidays that make them possible.
          </p>
        </div>

        <LongWeekendsTable longWeekends={longWeekends} />

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
      </section>
    </PageLayout>
  );
}
