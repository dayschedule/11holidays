'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Country } from '@/lib/countries-data';
import { CountryFlag } from '@/components/country-flag';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Sunset, Clock, CalendarDays } from 'lucide-react';

interface CountryListProps {
  countries: Country[];
  currentYear: number;
  type: 'holidays' | 'calendars';
}

export function CountryList({ countries, currentYear }: CountryListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCountries.map((country) => (
          <div
            key={country.code}
            className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-accent/50 transition"
          >
            {/* Country info */}
            <div className="flex items-center">
              <CountryFlag
                countryCode={country.code}
                className="w-12 h-8 mr-3 rounded"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-base">{country.name}</span>
                <span className="text-xs text-muted-foreground">
                  {country.code}
                </span>
              </div>
            </div>

            {/* Primary links */}
            <Link
              href={`/calendars/${country.slug}`}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            >
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              Calendar
            </Link>

            <Link
              href={`/upcoming-holidays/${country.slug}`}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              Upcoming
            </Link>

            <Link
              href={`/long-weekends/${country.slug}`}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors col-span-2"
            >
              <Sunset className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              Long Weekends
            </Link>

            <Link
              href={`/holidays/${country.code.toLowerCase()}/${currentYear}`}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors w-full"
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              All holidays {currentYear}
            </Link>
          </div>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No countries found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
