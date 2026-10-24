import { PageLayout } from '@/components/page-layout';
import { OccasionsList } from '@/components/occasions-list';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { fetchOccasionByCountry } from '@/lib/occassion-api';
import { getCountryByCode } from '@/lib/countries-data';
import { notFound } from 'next/navigation';
import { HolidaysFilters } from '@/components/holidays-filter';

interface PageProps {
  params: Promise<{
    country: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { country: countryCode } = await params;

  const country = getCountryByCode(countryCode);
  if (!country) {
    notFound();
  }

  const year = new Date().getFullYear();

  return {
    title: `${country.name} Holiday & Festival List ${year} | 11holidays.com`,
    description: `Explore the complete list of public holidays, religious festivals, observances, and national celebrations in ${country.name} for ${year}. Browse holiday dates, significance and upcoming events.`,
  };
}

export default async function HolidaysPage({
  params,
  searchParams,
}: PageProps) {
  const { country: countryCode } = await params;
  const { search = '' } = await searchParams;

  const country = getCountryByCode(countryCode);
  if (!country) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const { env } = getCloudflareContext();

  const occasions = await fetchOccasionByCountry(env, country.code);

  return (
    <PageLayout country={country}>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight md:text-4xl">
          Holidays in {country.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          List of public holidays, religious festivals, observances, and
          national celebrations in {country.name} - Year {currentYear}
        </p>
      </div>

      <HolidaysFilters
        countryCode={country.code}
        showSearch={true}
        search={search}
      />

      <OccasionsList occasions={occasions} />
    </PageLayout>
  );
}
