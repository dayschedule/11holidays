'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountryFlag } from '@/components/country-flag';
import { Search } from 'lucide-react';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';

export function HolidaySearchForm() {
  const currentYear = new Date().getFullYear();

  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const handleSearch = () => {
    if (selectedCountry && year) {
      router.push(`/holidays/${selectedCountry.toLowerCase()}/${year}`);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger id="country" className="w-full">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES_WITH_SLUG.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <CountryFlag
                      countryCode={country.code}
                      className="w-6 h-4 rounded"
                    />
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={currentYear.toString()}
          />
        </div>
      </div>
      <Button onClick={handleSearch} className="w-full" size="lg">
        <Search className="mr-2 h-4 w-4" />
        Get Holidays
      </Button>
    </div>
  );
}
