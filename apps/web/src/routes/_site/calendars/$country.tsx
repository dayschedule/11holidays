import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { CalendarGenerator } from '@/components/calendar/calendar-generator';
import { OccasionsList } from '@/components/occasions-list';
import { Button } from '@/components/ui/button';
import { getCountryBySlug } from '@/lib/countries-data';
import { calendarSearchSchema } from '@/lib/custom-calendar';
import { seo } from '@/lib/seo';
import { getCountryHolidays, getUpcomingOccasions } from '@/server/holidays';

export const Route = createFileRoute('/_site/calendars/$country')({
  validateSearch: calendarSearchSchema,
  loaderDeps: ({ search }) => ({ year: search.year ?? new Date().getFullYear() }),
  loader: async ({ params, deps }) => {
    const country = getCountryBySlug(params.country);
    if (!country) throw notFound();
    const [{ holidays }, occasions] = await Promise.all([
      getCountryHolidays({ data: { code: country.code, year: deps.year } }),
      getUpcomingOccasions({ data: { code: country.code, limit: 4 } }),
    ]);
    return { country, year: deps.year, holidays, occasions };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { country, year } = loaderData;
    return seo({
      title: `${country.name} Holiday Calendar ${year} - Printable, Customizable & Free PDF | 11holidays`,
      description: `Create a custom ${country.name} holiday calendar for ${year}. Select holidays, add company days off, choose a theme and print, download PDF/PNG, or embed it on your website.`,
      keywords: [
        `${country.name} holiday calendar ${year}`,
        `printable ${country.name} calendar`,
        `${country.name} company holiday list`,
        'custom holiday calendar',
        'holiday calendar generator',
      ],
      path: `/calendars/${params.country}`,
    });
  },
  component: CalendarGeneratorPage,
});

function CalendarGeneratorPage() {
  const { country, year, holidays, occasions } = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <div className="space-y-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Calendars', to: '/calendars' },
          { label: `${country.name} Calendar` },
        ]}
      />

      <div className="no-print space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {country.name} Holiday Calendar {year}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Pick the holidays you observe, add your own days off and save it as your company or team calendar. Print it,
          download as PDF, PNG or iCal, share a link, or embed it on your website.
        </p>
      </div>

      <CalendarGenerator country={country} year={year} holidays={holidays} search={search} />

      <section className="no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Explore holidays in {country.name}</h2>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to="/holidays/$country" params={{ country: country.code.toLowerCase() }}>
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <OccasionsList occasions={occasions} columns={4} />
      </section>
    </div>
  );
}
