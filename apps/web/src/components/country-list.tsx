import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Calendar, CalendarDays, Clock, Search, Sunset } from 'lucide-react';
import type { Country } from '@/lib/countries-data';
import { CountryFlag } from '@/components/country-flag';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface CountryListProps {
  countries: Country[];
  currentYear: number;
  type: 'holidays' | 'calendars';
  layout?: 'cards' | 'table';
}

const linkClass =
  'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-accent';

export function CountryList({ countries, currentYear, type, layout = 'cards' }: CountryListProps) {
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

      {layout === 'table' ? (
        <CountryTable countries={filteredCountries} currentYear={currentYear} />
      ) : (
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
      )}

      {filteredCountries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No countries found matching &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}

const tableLinkClass =
  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-primary';

function CountryTable({ countries, currentYear }: { countries: Country[]; currentYear: number }) {
  if (countries.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Country</TableHead>
            <TableHead className="hidden md:table-cell">Region</TableHead>
            <TableHead className="pr-4 text-right sm:text-left">Holidays & tools</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {countries.map((country) => {
            const code = country.code.toLowerCase();
            return (
              <TableRow key={country.code}>
                <TableCell className="py-2.5 pl-4">
                  <Link
                    to="/holidays/$country/$slug"
                    params={{ country: code, slug: String(currentYear) }}
                    className="group flex items-center gap-3"
                  >
                    <CountryFlag countryCode={country.code} className="h-5 w-[30px] shrink-0 rounded-[3px] shadow-sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold group-hover:text-primary">{country.name}</span>
                      <span className="block text-xs text-muted-foreground">{country.code}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {country.sub_region || country.region}
                </TableCell>
                <TableCell className="py-2.5 pr-4">
                  <div className="flex flex-wrap justify-end gap-1 sm:justify-start">
                    <Link
                      to="/holidays/$country/$slug"
                      params={{ country: code, slug: String(currentYear) }}
                      className={tableLinkClass}
                      title={`${country.name} holidays ${currentYear}`}
                    >
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-festive-coral" />
                      <span className="hidden sm:inline">{currentYear} holidays</span>
                    </Link>
                    <Link
                      to="/calendars/$country"
                      params={{ country: country.slug! }}
                      className={tableLinkClass}
                      title={`${country.name} calendar`}
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-festive-violet" />
                      <span className="hidden sm:inline">Calendar</span>
                    </Link>
                    <Link
                      to="/upcoming-holidays/$country"
                      params={{ country: country.slug! }}
                      className={tableLinkClass}
                      title={`Upcoming holidays in ${country.name}`}
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0 text-festive-teal" />
                      <span className="hidden sm:inline">Upcoming</span>
                    </Link>
                    <Link
                      to="/long-weekends/$country"
                      params={{ country: country.slug! }}
                      className={tableLinkClass}
                      title={`Long weekends in ${country.name}`}
                    >
                      <Sunset className="h-3.5 w-3.5 shrink-0 text-festive-saffron" />
                      <span className="hidden sm:inline">Long weekends</span>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
