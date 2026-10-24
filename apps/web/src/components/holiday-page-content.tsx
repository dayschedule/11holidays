import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { AlertCircle, CalendarDays, CalendarPlus, Code2, LayoutGrid, List, Sunset } from 'lucide-react';
import { ApiExamples } from '@/components/api-examples';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryFlag } from '@/components/country-flag';
import { CountrySelect } from '@/components/country-select';
import { Countdown } from '@/components/festive';
import { HolidaysTable } from '@/components/holidays-table';
import { PageLayout } from '@/components/page-layout';
import { HolidayLegend, YearGrid } from '@/components/calendar/year-grid';
import { Button } from '@/components/ui/button';
import type { Country } from '@/lib/countries-data';
import { holidayKind, occasionParams, type Holiday } from '@/lib/holidays-api';
import { generateLongWeekends } from '@/lib/long-weekends';
import { SITE_URL } from '@/lib/seo';
import { cn } from '@/lib/utils';

interface HolidayPageContentProps {
  country: Country;
  year: number;
  holidays: Holiday[];
}

export function HolidayPageContent({ country, year, holidays }: HolidayPageContentProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const code = country.code.toLowerCase();

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const longWeekends = generateLongWeekends(holidays).filter((lw) => lw.leavesNeeded === 0);
    return {
      total: holidays.length,
      public: holidays.filter((h) => holidayKind(h.type) === 'public').length,
      longWeekends: longWeekends.length,
      upcomingLongWeekend: longWeekends.find((lw) => isAfter(parseISO(lw.endDate), startOfDay(new Date()))),
      next: holidays.find((h) => h.date >= today),
    };
  }, [holidays]);

  const calendarHolidays = useMemo(
    () => holidays.map((h) => ({ id: String(h.holiday_id), date: h.date, name: h.name, type: h.type, url: h.url })),
    [holidays]
  );

  const subscribeUrl = `${SITE_URL.replace('https://', 'webcal://')}/ics/${code}`;
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  return (
    <PageLayout country={country}>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Countries', to: '/countries' },
          { label: `${country.name} Holidays`, to: '/holidays/$country', params: { country: code } },
          { label: String(year) },
        ]}
      />

      <header className="space-y-5">
        <div className="flex items-center gap-4">
          <CountryFlag countryCode={country.code} className="h-10 w-14 shrink-0 rounded-md shadow-md sm:h-12 sm:w-16" />
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {country.name} Holidays {year}
            </h1>
            <p className="text-muted-foreground">
              All public holidays, festivals and observances in {country.name} for {year}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CountrySelect
            value={country.code}
            onChange={(c) =>
              navigate({ to: '/holidays/$country/$slug', params: { country: c.code.toLowerCase(), slug: String(year) } })
            }
            className="sm:w-64"
          />
          <div className="flex gap-1 overflow-x-auto rounded-full border bg-card p-1">
            {years.map((y) => (
              <Link
                key={y}
                to="/holidays/$country/$slug"
                params={{ country: code, slug: String(y) }}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  y === year ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                )}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total holidays" value={stats.total} />
        <Stat label="Public holidays" value={stats.public} accent />
        <Stat label="Long weekends" value={stats.longWeekends} />
        <div className="col-span-2 rounded-2xl border bg-card p-4 shadow-xs lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Next holiday</p>
          {stats.next ? (
            <>
              {stats.next.url ? (
                <Link
                  to="/holidays/$country/$slug"
                  params={occasionParams(stats.next.url)}
                  className="line-clamp-1 font-semibold hover:text-primary"
                >
                  {stats.next.name}
                </Link>
              ) : (
                <p className="line-clamp-1 font-semibold">{stats.next.name}</p>
              )}
              <p className="text-xs text-muted-foreground">{format(parseISO(stats.next.date), 'EEE, MMM d')}</p>
            </>
          ) : (
            <p className="font-semibold">—</p>
          )}
        </div>
      </div>

      {stats.next && year === new Date().getFullYear() && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border bg-gradient-to-r from-festive-coral/10 via-festive-saffron/10 to-festive-violet/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Countdown to <span className="font-semibold">{stats.next.name}</span>
          </p>
          <Countdown date={stats.next.date} variant="card" />
        </div>
      )}

      {/* View toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full border bg-card p-1">
          <button
            type="button"
            onClick={() => setView('list')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
              view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            <List className="h-4 w-4" /> List
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
              view === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" /> Calendar
          </button>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-full">
          <Link to="/calendars/$country" params={{ country: country.slug! }} search={{ year }}>
            <CalendarDays className="h-4 w-4" /> Customize & print
          </Link>
        </Button>
      </div>

      {view === 'list' ? (
        <HolidaysTable holidays={holidays} country={country} year={year} filter />
      ) : (
        <div className="space-y-4">
          <HolidayLegend />
          <YearGrid year={year} holidays={calendarHolidays} />
        </div>
      )}

      {/* Tools */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ToolLink
          icon={<CalendarPlus className="h-5 w-5" />}
          title="Subscribe to calendar"
          text="Auto-updating feed for Google, Outlook & Apple"
          href={`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(subscribeUrl)}`}
          secondary={{ label: 'webcal / iCal link', href: subscribeUrl }}
        />
        <Link
          to="/widget"
          search={{ country: country.slug }}
          className="group flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-xs transition hover:border-primary/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festive-teal/15 text-festive-teal">
            <Code2 className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold group-hover:text-primary">Embed on your website</span>
            <span className="text-sm text-muted-foreground">Free {country.name} holidays widget</span>
          </span>
        </Link>
        <Link
          to="/long-weekends/$country"
          params={{ country: country.slug! }}
          className="group flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-xs transition hover:border-primary/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festive-saffron/20 text-amber-600 dark:text-festive-saffron">
            <Sunset className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold group-hover:text-primary">Plan long weekends</span>
            <span className="text-sm text-muted-foreground">
              {stats.upcomingLongWeekend
                ? `Next: ${stats.upcomingLongWeekend.occasion} (${stats.upcomingLongWeekend.days} days)`
                : 'Make the most of your leaves'}
            </span>
          </span>
        </Link>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-muted/30 p-4 text-sm">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="leading-relaxed text-muted-foreground">
          We strive to provide an accurate and up-to-date holiday list for {country.name}. However,
          some holiday dates may change. If you discover any discrepancies, kindly{' '}
          <a
            target="_blank"
            rel="nofollow noreferrer"
            href="https://github.com/dayschedule/11holidays/issues"
            className="text-primary hover:underline"
          >
            report to us
          </a>
          .
        </p>
      </div>

      <section className="space-y-6 rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div>
          <h3 className="mb-2 text-lg font-semibold">
            How many holidays are there in {country.name} in {year}?
          </h3>
          <p className="text-muted-foreground">
            There are {stats.public} public holidays and {stats.total} holidays and observances in total in{' '}
            {country.name} in {year}. Planning ahead?{' '}
            <Link to="/upcoming-holidays/$country" params={{ country: country.slug! }} className="text-primary underline">
              Check upcoming holidays
            </Link>
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold">
            How do I add {country.name} holidays to my calendar?
          </h3>
          <p className="text-muted-foreground">
            Use the <strong>Subscribe to calendar</strong> link above to add an auto-updating feed to
            Google Calendar, Outlook or Apple Calendar, or use <strong>Export → Calendar (.ics)</strong>{' '}
            to download this year&apos;s holidays.
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-semibold">
            How to retrieve the {country.name} holidays list via API?
          </h3>
          <p className="mb-3 text-muted-foreground">
            Make a GET request to{' '}
            <code className="rounded bg-muted px-2 py-1 text-sm">
              v1/holidays?country={country.code}&year={year}
            </code>{' '}
            to retrieve this list. Here is an example using our{' '}
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
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-50 sm:text-sm">
            <code>{`// npm i 11holidays
import HolidaysApi from '11holidays';

const instance = new HolidaysApi(API_KEY);
const holidays = await instance.holidays.list({
  country: '${country.code}',
  year: '${year}'
});`}</code>
          </pre>
        </div>
      </section>

      <ApiExamples countryCode={country.code} year={year} />
    </PageLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-xs">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('text-3xl font-bold', accent && 'text-primary')}>{value}</p>
    </div>
  );
}

function ToolLink({
  icon,
  title,
  text,
  href,
  secondary,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
  secondary: { label: string; href: string };
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-xs">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festive-coral/15 text-festive-coral">
        {icon}
      </span>
      <span className="min-w-0">
        <a href={href} target="_blank" rel="noreferrer nofollow" className="block font-semibold hover:text-primary">
          {title}
        </a>
        <span className="block text-sm text-muted-foreground">{text}</span>
        <a href={secondary.href} className="text-xs text-primary hover:underline">
          {secondary.label}
        </a>
      </span>
    </div>
  );
}
