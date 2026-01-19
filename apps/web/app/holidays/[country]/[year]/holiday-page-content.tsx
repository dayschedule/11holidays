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
import { AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Holiday } from '@/lib/holidays-api';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface HolidayPageContentProps {
  country: Country;
  year: number;
  holidaysData: {
    holidays: Holiday[];
    country: string;
    year: number;
  };
}

const publicHolidays = ['public', 'gazetted', 'national', 'federal'];

const countPublicHolidays = (holidays: Holiday[]) => {
  return holidays.filter((h) =>
    publicHolidays.some((x) => h.type.toLowerCase().includes(x)),
  ).length;
};

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
            { label: `${country.name} Holidays` },
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
                {country.name} {year} Holidays
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              List of public holidays in {country.name} for year {year}
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

            <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-4 text-sm">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground leading-relaxed">
                We strive to provide an accurate and up-to-date holiday list for{' '}
                {country.name}. However, please note that some holiday dates may
                change. If you discover any discrepancies, kindly{' '}
                <Link
                  target="_blank"
                  rel="nofollow"
                  href="https://github.com/dayschedule/11holidays/issues"
                  className="text-primary hover:underline"
                >
                  report to us
                </Link>
                .
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Holiday Type Color Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Holidays are color-coded based on their types:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">
                      Public Holiday
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Public, National, Federal, and Gazetted holidays
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                      Local Holiday
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Local, Regional, State, and Provincial holidays
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                      Other Holiday
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Observances and other types of holidays
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    How many holidays in {country.name} this year in {year}?
                  </h3>
                  <p className="text-muted-foreground">
                    There are {countPublicHolidays(holidaysData.holidays)}{' '}
                    public holidays in {country.name} in {year}.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    How to retrieve the {country.name} holidays list via API?
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Simply make a GET request to{' '}
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      v1/holidays?country={country.code}&year={year}
                    </code>{' '}
                    API to retrieve this list of {country.name} holidays.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    Here is an example using Node.js and our{' '}
                    <a
                      href="https://www.npmjs.com/package/11holidays"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      official package on NPM
                    </a>
                    :
                  </p>
                  <div className="rounded-lg bg-slate-950 p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-50">
                      <code>{`// Install the 11holidays package from NPM
// npm i 11holidays

import HolidaysApi from '11holidays';

const instance = new HolidaysApi(API_KEY);
const holidays = await instance.holidays.list({
  country: '${country.code}',
  year: '${year}'
});
console.log(holidays);`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ApiExamples countryCode={country.code} year={year} />
          </div>

          <div className="lg:col-span-3">
            <Card className="sticky top-20 border-dashed">
              <CardContent>
                <div className="flex flex-col items-center justify-center text-center">
                  <Badge variant="outline" className="text-xs mb-4">Ads</Badge>
                  <Image
                    src="/img/dayschedule.svg"
                    alt="DaySchedule"
                    className="mb-4"
                    width={180}
                    height={40}
                  />
                  <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                    Create your free appointment booking page
                  </p>
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Easy online booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Automated reminders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Client management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Free forever</span>
                    </div>
                  </div>
                  <Button className="w-full max-w-xs" asChild>
                    <Link
                      href="https://dayschedule.com/?utm_source=11holidays"
                      target="_blank"
                      rel="nofollow noindex"
                    >
                      Create Appointment Page
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
