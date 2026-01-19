import Link from 'next/link';
import { HolidaySearchForm } from '@/components/holiday-search-form';
import { ApiExamples } from '@/components/api-examples';
import { CountryFlag } from '@/components/country-flag';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Globe, Code } from 'lucide-react';

export const metadata = {
  title: `Holidays API & Calendar for ${new Date().getFullYear()} - 11holiday.com`,
  description:
    'Access public holidays for 230+ countries. Get holiday data via API with our free service. Perfect for developers and businesses.',
  keywords: [
    'holidays',
    'public holidays',
    'API',
    'calendar',
    'international holidays',
  ],
};

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container py-8 md:py-12 lg:py-16">
      <div className="mx-auto flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Holidays API for Developers
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Global holidays API for fetch public holidays list by countries,
            cities and region to integrate easily in any app.
          </p>
        </div>

        <HolidaySearchForm />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full mt-8 text-left">
          <Card>
            <CardHeader className="space-y-1 pb-4">
              <Calendar className="h-10 w-10 mb-2" />
              <CardTitle className="text-xl">230+ Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive holiday data for major countries worldwide
                including the USA, UK, Canada, France, Germany, China, Japan,
                India and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1 pb-4">
              <Globe className="h-10 w-10 mb-2" />
              <CardTitle className="text-xl">Always Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Over 7000+ holidays data accessible via API on federal, state,
                and local levels with simple GET requests regularly updated from
                official sources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1 pb-4">
              <Code className="h-10 w-10 mb-2" />
              <CardTitle className="text-xl">RESTful API</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simple REST API with JSON responses with all holidays for an
                year, country code or type of holidays, e.g national holidays,
                bank holidays etc.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full bg-primary/5 border-primary/20 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Get Your Free API Key</CardTitle>
            <CardDescription className="text-base">
              Start integrating holiday data into your applications today
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/api-key">Get Free API Key</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/countries">Browse Countries</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="w-full mt-8">
          <ApiExamples year={currentYear} />
        </div>

        <div className="w-full mt-8 space-y-4 text-left">
          <h2 className="text-3xl font-bold">Popular Countries</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { code: 'US', name: 'United States' },
              { code: 'GB', name: 'United Kingdom' },
              { code: 'CA', name: 'Canada' },
              { code: 'AU', name: 'Australia' },
              { code: 'DE', name: 'Germany' },
              { code: 'FR', name: 'France' },
            ].map((country) => (
              <Button
                key={country.code}
                variant="outline"
                asChild
                className="justify-start h-auto py-4"
              >
                <Link
                  href={`/holidays/${country.code.toLowerCase()}/${currentYear}`}
                >
                  <CountryFlag
                    countryCode={country.code}
                    className="w-10 h-7 mr-3 rounded"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{country.name}</span>
                    <span className="text-xs text-muted-foreground">
                      View {currentYear} holidays
                    </span>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
