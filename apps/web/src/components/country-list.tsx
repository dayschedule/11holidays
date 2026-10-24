import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Calendar, CalendarDays, Clock, Search, Sunset } from 'lucide-react';
import type { Country } from '@/lib/countries-data';
import { CountryFlag } from '@/components/country-flag';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CountryListProps {
  countries: Country[];
  currentYear: number;
  type: 'holidays' | 'calendars';
}

const linkClass =
  'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-accent';

export function CountryList({ countries, currentYear, type }: CountryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('All');

  const regions = useMemo(
    () => ['All', ...Array.from(new Set(countries.map((c) => c.region).filter(Boolean))).sort()],
    [countries]
  );

  const filteredCountries = countries.filter((country) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      country.name.toLowerCase().includes(q) ||
      country.official_name?.toLowerCase().includes(q) ||
      country.code.toLowerCase().includes(q);
    return matchesQuery && (region === 'All' || country.region === region);
  });

  return (
    <div className="space-y-6">
      <div className="sticky top-[68px] z-30 -mx-4 space-y-3 bg-background/90 px-4 py-3 backdrop-blur md:mx-0 md:px-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search countries…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-full pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                region === r ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCountries.map((country) => (
          <div
            key={country.code}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs transition hover:shadow-md"
          >
            <Link
              to={type === 'calendars' ? '/calendars/$country' : '/holidays/$country/$slug'}
              params={
                type === 'calendars'
                  ? { country: country.slug! }
                  : { country: country.code.toLowerCase(), slug: String(currentYear) }
              }
              className="group flex items-center"
            >
              <CountryFlag countryCode={country.code} className="mr-3 h-8 w-12 rounded shadow-sm" />
              <div className="flex flex-col">
                <span className="text-base font-semibold group-hover:text-primary">{country.name}</span>
                <span className="text-xs text-muted-foreground">
                  {country.code} · {country.sub_region || country.region}
                </span>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/holidays/$country/$slug"
                params={{ country: country.code.toLowerCase(), slug: String(currentYear) }}
                className={linkClass}
              >
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-festive-coral" />
                {currentYear} holidays
              </Link>
              <Link to="/calendars/$country" params={{ country: country.slug! }} className={linkClass}>
                <Calendar className="h-3.5 w-3.5 shrink-0 text-festive-violet" />
                Calendar
              </Link>
              <Link to="/upcoming-holidays/$country" params={{ country: country.slug! }} className={linkClass}>
                <Clock className="h-3.5 w-3.5 shrink-0 text-festive-teal" />
                Upcoming
              </Link>
              <Link to="/long-weekends/$country" params={{ country: country.slug! }} className={linkClass}>
                <Sunset className="h-3.5 w-3.5 shrink-0 text-festive-saffron" />
                Long weekends
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No countries found matching &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
