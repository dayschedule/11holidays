import { createFileRoute } from '@tanstack/react-router';
import { CountryList } from '@/components/country-list';
import { PageLayout } from '@/components/page-layout';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';
import { currentYear } from '@/lib/holidays-api';
import { SITE_URL, seo, webPageSchema } from '@/lib/seo';

export const Route = createFileRoute('/_site/countries')({
  head: () =>
    seo({
      title: 'All Countries - Public Holidays for 230+ Countries | 11holidays.com',
      description: 'Browse public holidays for 230+ countries. Select a country to view its holiday list.',
      path: '/countries',
      jsonLd: [
        webPageSchema('/countries', 'Public holidays by country', undefined, 'CollectionPage'),
        {
          '@type': 'ItemList',
          name: 'Countries',
          numberOfItems: COUNTRIES_WITH_SLUG.length,
          itemListElement: COUNTRIES_WITH_SLUG.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${c.name} holidays`,
            url: `${SITE_URL}/holidays/${c.code.toLowerCase()}/${currentYear}`,
          })),
        },
      ],
    }),
  component: CountriesPage,
});

function CountriesPage() {
  return (
    <PageLayout sidebar={false}>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Browse countries</h1>
        <p className="text-muted-foreground">Select a country to view its public holidays for {currentYear}</p>
      </div>

      <CountryList countries={COUNTRIES_WITH_SLUG} currentYear={currentYear} type="holidays" />
    </PageLayout>
  );
}
