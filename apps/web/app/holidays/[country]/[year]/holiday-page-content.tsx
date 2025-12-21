'use client';

import { useState, useEffect } from 'react';
import { HolidaysTable } from '@/components/holidays-table';
import { ApiExamples } from '@/components/api-examples';
import { YearSelector } from '@/components/year-selector';
import { CountryFlag } from '@/components/country-flag';
import { Breadcrumb } from '@/components/breadcrumb';
import { UpgradeDialog } from '@/components/upgrade-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Country } from '@/lib/countries-data';

interface HolidayPageContentProps {
  country: Country;
  year: number;
  holidaysData: any;
}

export function HolidayPageContent({
  country,
  year,
  holidaysData,
}: HolidayPageContentProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      setShowUpgradeDialog(true);
    }
  }, [year]);

  return (
    <div className="container">
      <UpgradeDialog
        year={year}
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />

      <div className="mx-auto space-y-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Countries', href: '/countries' },
            { label: `${country.name} ${year} Holidays` },
          ]}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <CountryFlag
                countryCode={country.code}
                className="w-16 h-12 rounded"
              />
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                {country.name} {year} holiday&apos;s calendar
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Public Holidays in {year}
            </p>
          </div>
          <YearSelector
            currentCountry={country.code.toLowerCase()}
            currentYear={year}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-9 space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Holidays</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {holidaysData.holidays.length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Country Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{country.code}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Year</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{year}</p>
                </CardContent>
              </Card>
            </div>

            <HolidaysTable
              holidays={holidaysData.holidays}
              country={country}
              year={year}
            />

            <ApiExamples countryCode={country.code} year={year.toString()} />
          </div>

          <div className="lg:col-span-3">
            <Card className="sticky top-20 bg-muted/50 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Advertisement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center min-h-[600px] text-muted-foreground">
                  <p>Ad Space</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
