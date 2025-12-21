import { notFound } from 'next/navigation';
import { fetchHolidays } from '@/lib/holidays-api';
import { getCountryByCode } from '@/lib/countries-data';
import { HolidayPageContent } from './holiday-page-content';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface PageProps {
  params: Promise<{
    country: string;
    year: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { country: countryParam, year } = await params;

  const country = getCountryByCode(countryParam);
  if (!country) {
    return {
      title: 'Country Not Found',
    };
  }

  return {
    title: `${country.name} Public Holidays ${year} - 11holidays.com`,
    description: `Complete list of public holidays in ${country.name} for ${year}. View, download, and integrate holiday data via API.`,
  };
}

export default async function HolidayPage({ params }: PageProps) {
  const { country: countryParam, year: yearParam } = await params;

  const country = getCountryByCode(countryParam);
  const year = parseInt(yearParam);

  if (!country || isNaN(year) || year < 2000 || year > 2100) {
    notFound();
  }

  const { env } = getCloudflareContext();
  const holidaysData = await fetchHolidays(env, country.code, year);

  return (
    <HolidayPageContent
      country={country}
      year={year}
      holidaysData={holidaysData}
    />
  );
}
