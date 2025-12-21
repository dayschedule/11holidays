import { notFound } from 'next/navigation';
import { fetchHolidays } from '@/lib/holidays-api';
import { getCountryByCode } from '@/lib/countries-data';
import { HolidayPageContent } from './holiday-page-content';

interface PageProps {
  params: Promise<{
    country: string;
    year: string;
  }>;
}

// export async function generateStaticParams() {
//   const currentYear = new Date().getFullYear();
//   const years = [currentYear, currentYear + 1];

//   const paths = countries.flatMap((country) =>
//     years.map((year) => ({
//       country: country.code.toLowerCase(),
//       year: year.toString(),
//     }))
//   );

//   return paths;
// }

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

  const holidaysData = await fetchHolidays(country.code, year);

  return (
    <HolidayPageContent
      country={country}
      year={year}
      holidaysData={holidaysData}
    />
  );
}
