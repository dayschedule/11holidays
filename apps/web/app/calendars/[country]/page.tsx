import { COUNTRIES_WITH_SLUG, getCountryBySlug } from '@/lib/countries-data';
import { CalendarGenerator } from '../components/calendar-generator';
import { notFound } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { fetchHolidays } from '@/lib/holidays-api';
import { Breadcrumb } from '../../../components/breadcrumb';

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

  return {
    title: `${country.name} Holidays Calendar - 11holidays`,
    description: ``,
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

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
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
    </div>
  );
}
