import { createFileRoute, notFound } from '@tanstack/react-router';
import { HolidayPageContent } from '@/components/holiday-page-content';
import { OccasionPageContent } from '@/components/occasion-page-content';
import { getCountryByCode } from '@/lib/countries-data';
import { seo } from '@/lib/seo';
import { getCountryHolidays, getOccasionPage } from '@/server/holidays';

function isYear(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export const Route = createFileRoute('/_site/holidays/$country/$slug')({
  loader: async ({ params }) => {
    const country = getCountryByCode(params.country);
    if (!country) throw notFound();

    // /holidays/in/2026
    if (isYear(params.slug)) {
      const year = Number(params.slug);
      if (year < 2000 || year > 2100) throw notFound();
      const { holidays } = await getCountryHolidays({ data: { code: country.code, year } });
      return { kind: 'year' as const, country, year, holidays };
    }

    // /holidays/in/diwali
    const page = await getOccasionPage({ data: { code: country.code, slug: params.slug } });
    if (!page) throw notFound();
    return { kind: 'occasion' as const, country, ...page };
  },
  headers: () => ({ 'Cache-Control': 'public, max-age=300, s-maxage=3600' }),
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { country } = loaderData;

    if (loaderData.kind === 'year') {
      const { year } = loaderData;
      return seo({
        title: `${country.name} Holidays ${year} - Public Holidays List & Calendar | 11holidays`,
        description: `All ${loaderData.holidays.length} public holidays and observances in ${country.name} for ${year}. See dates, weekdays, long weekends, subscribe to the calendar or download as Excel, PDF or iCal.`,
        keywords: [
          `${country.name} holidays ${year}`,
          `${country.name} public holidays`,
          `${country.name} holiday calendar ${year}`,
          `${country.name} bank holidays ${year}`,
          `${country.code} holidays`,
        ],
        path: `/holidays/${params.country}/${year}`,
      });
    }

    const { occasion } = loaderData;
    const description =
      occasion.description && occasion.description.length > 160
        ? `${occasion.description.slice(0, 157)}...`
        : occasion.description;

    return seo({
      title: `${occasion.name} in ${country.name} | Dates, History & Countdown`,
      description,
      keywords: [
        occasion.name,
        `${occasion.name} ${country.name}`,
        `${occasion.name} date`,
        `when is ${occasion.name}`,
        `${occasion.name} history`,
        `${country.name} holidays`,
      ],
      image: occasion.image?.url,
      type: 'article',
      path: `/holidays/${occasion.url}`,
    });
  },
  component: HolidayPage,
});

function HolidayPage() {
  const data = Route.useLoaderData();

  if (data.kind === 'year') {
    return <HolidayPageContent country={data.country} year={data.year} holidays={data.holidays} />;
  }

  return (
    <OccasionPageContent
      country={data.country}
      occasion={data.occasion}
      holidays={data.dates}
      upcomingHolidays={data.related}
    />
  );
}
