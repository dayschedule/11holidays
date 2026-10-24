import { useMemo } from 'react';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { z } from 'zod';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryFlag } from '@/components/country-flag';
import { CountrySelect } from '@/components/country-select';
import { OccasionsList } from '@/components/occasions-list';
import { PageLayout } from '@/components/page-layout';
import { Input } from '@/components/ui/input';
import { getCountryByCode } from '@/lib/countries-data';
import { currentYear } from '@/lib/holidays-api';
import { holidayListSchema, seo } from '@/lib/seo';
import { getCountryOccasions } from '@/server/holidays';

export const Route = createFileRoute('/_site/holidays/$country/')({
  validateSearch: z.object({ search: z.string().optional().catch(undefined) }),
  loader: async ({ params }) => {
    const country = getCountryByCode(params.country);
    if (!country) throw notFound();
    const occasions = await getCountryOccasions({ data: { code: country.code } });
    return { country, occasions };
  },
  headers: () => ({ 'Cache-Control': 'public, max-age=300, s-maxage=3600' }),
  head: ({ loaderData, params }) =>
    loaderData
      ? seo({
          title: `${loaderData.country.name} Holiday & Festival List ${currentYear} | 11holidays.com`,
          description: `Explore public holidays, religious festivals, observances, and national celebrations in ${loaderData.country.name} for ${currentYear}. Browse holiday dates, significance and upcoming events.`,
          path: `/holidays/${params.country}`,
          jsonLd: [
            holidayListSchema(
              `${loaderData.country.name} holidays and festivals ${currentYear}`,
              loaderData.country.name,
              [...loaderData.occasions].sort((a, b) => a.date.localeCompare(b.date))
            ),
          ],
        })
      : {},
  component: CountryOccasionsPage,
});

function CountryOccasionsPage() {
  const { country, occasions } = Route.useLoaderData();
  const { search = '' } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    return [...occasions]
      .filter((o) => o.name.toLowerCase().includes(q))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [occasions, search]);

  return (
    <PageLayout country={country}>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Holidays', to: '/holidays' },
          { label: `${country.name} Holidays` },
        ]}
      />
      <div className="flex items-center gap-4">
        <CountryFlag countryCode={country.code} className="h-10 w-14 shrink-0 rounded-md shadow-md" />
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Holidays in {country.name}</h1>
          <p className="text-muted-foreground">
            Public holidays, religious festivals, observances and national celebrations in {country.name} · {currentYear}
          </p>
        </div>
      </div>

      <div className="sticky top-[68px] z-30 -mx-4 flex flex-col gap-3 bg-background/90 px-4 py-3 backdrop-blur sm:flex-row md:mx-0 md:px-0">
        <CountrySelect
          value={country.code}
          onChange={(c) => navigate({ to: '/holidays/$country', params: { country: c.code.toLowerCase() } })}
          className="sm:w-64"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) =>
              navigate({ search: { search: e.target.value || undefined }, replace: true, resetScroll: false })
            }
            placeholder={`Search ${country.name} holidays…`}
            className="pl-9"
          />
        </div>
      </div>

      <OccasionsList occasions={sorted} emptyMessage={`No holidays found matching "${search}".`} />
    </PageLayout>
  );
}
