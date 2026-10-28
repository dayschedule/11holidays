import { useEffect, useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { CalendarCheck, Code2, Printer, Save } from 'lucide-react';
import { CountryList } from '@/components/country-list';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';
import { loadSavedCalendars, type SavedCalendar } from '@/lib/custom-calendar';
import { currentYear } from '@/lib/holidays-api';
import { seo, softwareAppSchema } from '@/lib/seo';

export const Route = createFileRoute('/_site/calendars/')({
  head: () =>
    seo({
      title: `Holiday Calendar Maker ${currentYear()} - Printable Holiday Calendars for 230+ Countries`,
      description:
        'Create a custom holiday calendar for any country. Choose holidays, add company days off, pick a theme and print or download PDF, PNG and iCal for free.',
      path: '/calendars',
      jsonLd: [
        softwareAppSchema(
          'Holiday calendar maker',
          '/calendars',
          'Create a custom holiday calendar for any country and print it or download PDF, PNG and iCal.'
        ),
      ],
    }),
  component: CalendarsPage,
});

function CalendarsPage() {
  const [saved, setSaved] = useState<SavedCalendar[]>([]);
  useEffect(() => setSaved(loadSavedCalendars()), []);

  return (
    <PageLayout sidebar={false}>
      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-xs sm:p-10">
        <div className="bg-confetti absolute inset-0 opacity-30" />
        <div className="relative max-w-2xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Holiday calendar maker
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a {currentYear()} holiday calendar for your company, school or family. Select the holidays you
            observe, add your own days off, then print it or share it.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { icon: CalendarCheck, label: 'Pick holidays' },
              { icon: Save, label: 'Save as “Company X holidays”' },
              { icon: Printer, label: 'Print, PDF, PNG, iCal' },
              { icon: Code2, label: 'Embed anywhere' },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-2 font-medium">
                <f.icon className="h-4 w-4 text-primary" /> {f.label}
              </span>
            ))}
          </div>
          {saved.length > 0 && (
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/my-calendars">Open my {saved.length} saved calendar{saved.length > 1 ? 's' : ''}</Link>
            </Button>
          )}
        </div>
      </section>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Choose a country to start</h2>
      </div>
      <CountryList countries={COUNTRIES_WITH_SLUG} currentYear={currentYear()} type="calendars" />
    </PageLayout>
  );
}
