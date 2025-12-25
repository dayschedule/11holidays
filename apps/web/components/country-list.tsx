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
          <Button
            key={country.code}
            variant="outline"
            asChild
            className="h-auto justify-start p-4 hover:bg-accent"
          >
            <Link
              href={
                type === 'holidays'
                  ? `/holidays/${country.code.toLowerCase()}/${currentYear}`
                  : `/calendars/${country.slug}`
              }
            >
              <CountryFlag
                countryCode={country.code}
                className="w-12 h-8 mr-4 rounded"
              />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-base">{country.name}</span>
                <span className="text-xs text-muted-foreground">
                  {country.code}
                </span>
              </div>
            </Link>
          </Button>
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
