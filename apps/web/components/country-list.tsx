'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Country } from '@/lib/countries-data';
import { CountryFlag } from '@/components/country-flag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CountryListProps {
  countries: Country[];
  currentYear: number;
  type: 'holidays' | 'calendars';
}

export function CountryList({
  countries,
  currentYear,
  type,
}: CountryListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
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
            className="flex flex-col gap-4 rounded-lg border p-4 hover:bg-accent transition"
          >
            {/* Country info */}
            <div className="flex items-center">
              <CountryFlag
                countryCode={country.code}
                className="w-12 h-8 mr-4 rounded"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-base">{country.name}</span>
                <span className="text-xs text-muted-foreground">
                  {country.code}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/calendars/${country.slug}`}>View Calendar</Link>
              </Button>

              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link
                  href={`/holidays/${country.code.toLowerCase()}/${currentYear}`}
                >
                  View List
                </Link>
              </Button>
            </div>
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
