import { CountryList } from '@/components/country-list';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';

export const revalidate = 86400;

export const metadata = {
  title: 'All Countries - 11holidays.com',
  description:
    'Browse public holidays for 230+ countries. Select a country to view its holiday list.',
};

export default function CountriesPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Browse Countries
        </h1>
        <p className="text-lg text-muted-foreground">
          Select a country to view its public holidays for {currentYear}
        </p>
      </div>

      <CountryList
        countries={COUNTRIES_WITH_SLUG}
        currentYear={currentYear}
        type="holidays"
      />
    </div>
  );
}
