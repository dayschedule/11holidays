import { createFileRoute, notFound } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { HolidayPageContent } from '@/components/holiday-page-content';
import { OccasionPageContent } from '@/components/occasion-page-content';
import { getCountryByCode } from '@/lib/countries-data';
import { holidayKind } from '@/lib/holidays-api';
import { faqSchema, holidayDatasetSchema, holidayListSchema, seo, webPageSchema } from '@/lib/seo';
import { getCountryHolidays, getOccasionPage } from '@/server/holidays';

const longDate = (date: string) => format(parseISO(date), 'EEEE, MMMM d, yyyy');

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
      const { year, holidays } = loaderData;
      const path = `/holidays/${params.country}/${year}`;
      const publicHolidays = holidays.filter((h) => holidayKind(h.type) === 'public');
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
        path,
        jsonLd: [
          webPageSchema(path, `${country.name} Holidays ${year}`, undefined, 'CollectionPage'),
          holidayDatasetSchema(country.name, country.code, year, path),
          holidayListSchema(`${country.name} holidays ${year}`, country.name, holidays),
          faqSchema([
            {
              q: `How many public holidays are there in ${country.name} in ${year}?`,
              a: `${country.name} has ${publicHolidays.length} public holidays and ${holidays.length} holidays and observances in total in ${year}.`,
            },
            ...(publicHolidays.length
              ? [
                  {
                    q: `What are the public holidays in ${country.name} in ${year}?`,
                    a: publicHolidays.map((h) => `${h.name} (${format(parseISO(h.date), 'MMMM d')})`).join(', ') + '.',
                  },
                ]
              : []),
          ]),
        ],
      });
    }

    const { occasion, dates } = loaderData;
    const thisYear = new Date().getFullYear();
    const upcomingDates = dates.filter((d) => Number(d.date.slice(0, 4)) >= thisYear).slice(0, 3);
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
      jsonLd: upcomingDates.length
        ? [
            faqSchema(
              upcomingDates.map((d) => ({
                q: `When is ${occasion.name} in ${country.name} in ${d.date.slice(0, 4)}?`,
                a: `${occasion.name} in ${country.name} is on ${longDate(d.date)}.`,
              }))
            ),
          ]
        : undefined,
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
