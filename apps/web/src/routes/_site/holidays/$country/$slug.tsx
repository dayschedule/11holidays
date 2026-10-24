import { notFound } from 'next/navigation';
import { fetchHolidays, fetchHolidaysByOcasionId } from '@/lib/holidays-api';
import { getCountryByCode } from '@/lib/countries-data';
import { HolidayPageContent } from './holiday-page-content';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { fetchOccasion, fetchUpcomingOccasions } from '@/lib/occassion-api';
import { OccasionPageContent } from './occasion-page-content';

interface PageProps {
  params: Promise<{
    country: string;
    slug: string; // year or slug
  }>;
}

function isYear(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export async function generateMetadata({ params }: PageProps) {
  const { country: countryParam, slug: value } = await params;

  const country = getCountryByCode(countryParam);

  if (!country) {
    return {
      title: 'Not Found',
    };
  }

  // /holidays/india/2026
  if (isYear(value)) {
    return {
      title: `${country.name} Holidays in ${value} - 11holidays`,
      description: `View all official public holidays in ${country.name} for ${value}. See holiday dates, weekdays, observances, long weekends, and download the ${value} holiday calendar.`,
      keywords: [
        `${country.name} holidays ${value}`,
        `${country.name} public holidays`,
        `${country.name} holiday calendar ${value}`,
        `${country.name} bank holidays ${value}`,
        `${country.name} national holidays`,
        `${country.code} holidays`,
      ],
      openGraph: {
        title: `${country.name} Public Holidays ${value}`,
        description: `Complete list of public holidays in ${country.name} for ${value}.`,
        type: 'website',
      },
    };
  }

  // /holidays/india/diwali
  const slug = `${country.code.toLowerCase()}/${value}`;
  const { env } = getCloudflareContext();
  const occasion = await fetchOccasion(env, slug);
  if (!occasion)
    return {
      title: 'Not Found',
    };

  const metaDescription =
    occasion.description && occasion.description.length > 160
      ? `${occasion.description.slice(0, 157)}...`
      : occasion.description;

  return {
    title: `${occasion.name} in ${country.name} | Dates, History & Holiday Calendar`,
    description: metaDescription,
    keywords: [
      occasion.name,
      `${occasion.name} ${country.name}`,
      `${occasion.name} holiday`,
      `${occasion.name} date`,
      `${occasion.name} history`,
      `${occasion.name} significance`,
      `${country.name} holidays`,
    ],
    openGraph: {
      title: `${occasion.name} in ${country.name}`,
      description: metaDescription,
      type: 'article',
      images: occasion.image?.url
        ? [
            {
              url: occasion.image.url,
              alt: occasion.image.query || occasion.name,
            },
          ]
        : undefined,
    },
  };
}

export default async function HolidayPage({ params }: PageProps) {
  const { country: countryParam, slug: value } = await params;

  const country = getCountryByCode(countryParam);

  if (!country) {
    notFound();
  }

  const { env } = getCloudflareContext();

  // /holidays/india/2026
  if (isYear(value)) {
    const year = Number(value);

    if (year < 2000 || year > 2100) {
      notFound();
    }

    const holidaysData = await fetchHolidays(env, country.code, year);

    return (
      <HolidayPageContent
        country={country}
        year={year}
        holidaysData={holidaysData}
      />
    );
  }

  // /holidays/india/diwali
  const slug = `${country.code.toLowerCase()}/${value}`;
  const occasion = await fetchOccasion(env, slug);

  if (!occasion) {
    notFound();
  }

  const [holidays, upcomingHolidays] = await Promise.all([
    fetchHolidaysByOcasionId(env, occasion.occasion_id),
    fetchUpcomingOccasions(env, country.code, 4),
  ]);

  return (
    <OccasionPageContent
      country={country}
      occasion={occasion}
      holidays={holidays}
      upcomingHolidays={upcomingHolidays}
    />
  );
}
