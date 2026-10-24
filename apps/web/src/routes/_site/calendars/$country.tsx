import { COUNTRIES_WITH_SLUG, getCountryBySlug } from '@/lib/countries-data';
import { CalendarGenerator } from '../components/calendar-generator';
import { notFound } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { fetchHolidays } from '@/lib/holidays-api';
import { Breadcrumb } from '@/components/breadcrumb';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { OccasionsList } from '@/components/occasions-list';
import { ArrowRight } from 'lucide-react';
import { fetchUpcomingOccasions } from '@/lib/occassion-api';

interface PageProps {
  params: Promise<{
    country: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { country: countrySlug } = await params;

  const country = getCountryBySlug(countrySlug);
  if (!country) {
    return {
      title: 'Country Not Found',
    };
  }

  const year = new Date().getFullYear();

  return {
    title: `${country.name} Holidays Calendar ${year} | Free PDF & PNG Download`,
    description: `Generate and download a printable ${country.name} holidays calendar for ${year}. Customize themes, view public holidays by month or year, and export as PDF or PNG for free.`,
    keywords: [
      `${country.name} holidays`,
      `${country.name} public holidays`,
      `${country.name} holiday calendar`,
      `${country.name} holidays ${year}`,
      `printable ${country.name} calendar`,
      `${country.name} holiday planner`,
      `holiday calendar generator`,
      `public holiday calendar`,
    ],
    openGraph: {
      title: `${country.name} Holidays Calendar ${year}`,
      description: `Generate a customizable ${country.name} public holidays calendar and download it as PDF or PNG.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${country.name} Holidays Calendar ${year}`,
      description: `Create and download a printable ${country.name} holiday calendar for ${year}.`,
    },
  };
}

export default async function CalendarGeneratorPage({ params }: PageProps) {
  const { country: countrySlug } = await params;

  const country = getCountryBySlug(countrySlug);
  if (!country) {
    return notFound();
  }

  const currentYear = new Date().getFullYear();
  const { env } = getCloudflareContext();
  const holidaysData = await fetchHolidays(env, country.code, currentYear);

  const upcomingOccasions = await fetchUpcomingOccasions(env, country.code, 4);
  const countryCode = country.code.toLowerCase();

  return (
    <PageLayout country={country}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Calendars', href: '/calendars' },
          { label: `${country.name} Calendar` },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {country.name} Holidays Calendar
        </h1>
        <p className="text-muted-foreground">
          Create a {currentYear} {country.name} holidays calendar including all
          public and national holidays. Easily customize your design and
          download or print the calendar as a PDF or image.
        </p>
      </div>

      <CalendarGenerator
        countries={COUNTRIES_WITH_SLUG}
        currentYear={currentYear}
        preselectedCountry={country.code}
        holidaysData={holidaysData}
      />

      <section className="w-full mt-8 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Explore holidays in {country.name}
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
