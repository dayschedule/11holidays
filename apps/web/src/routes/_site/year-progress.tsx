import { Link, createFileRoute, useHydrated } from '@tanstack/react-router';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { StatCard } from '@/components/time/time-ui';
import { useNow } from '@/hooks/use-now';
import { currentYear } from '@/lib/holidays-api';
import { faqSchema, seo, softwareAppSchema } from '@/lib/seo';
import { browserTimeZone, zonedParts, zonedToUtc } from '@/lib/time';

const FAQ = [
  {
    q: 'What percentage of the year has passed?',
    a: 'The bar at the top of this page shows it live, to four decimal places, based on your local time zone.',
  },
  {
    q: 'How is year progress calculated?',
    a: 'It is the time elapsed since midnight on 1 January divided by the length of the year, so a leap year counts 366 days. Quarters are January to March, April to June, July to September and October to December.',
  },
];

export const Route = createFileRoute('/_site/year-progress')({
  head: () =>
    seo({
      title: `Year Progress ${currentYear()} - How Much of the Year Has Passed? | 11holidays`,
      description: `Live ${currentYear()} progress bar. See what percentage of the year, quarter, month, week and day has passed, and how many days are left.`,
      keywords: ['year progress', 'year progress bar', 'how much of the year has passed', 'days left in the year', 'percentage of year'],
      path: '/year-progress',
      jsonLd: [
        softwareAppSchema('Year progress', '/year-progress', 'Live progress of the current year, quarter, month, week and day.'),
        faqSchema(FAQ),
      ],
    }),
  component: YearProgressPage,
});

function Progress({ label, value, digits = 2, big }: { label: string; value: number; digits?: number; big?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className={big ? 'text-lg font-semibold' : 'text-sm font-medium'}>{label}</span>
        <span className={big ? 'text-3xl font-bold tabular-nums' : 'text-sm tabular-nums text-muted-foreground'} suppressHydrationWarning>
          {value.toFixed(digits)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={big ? 'h-5 overflow-hidden rounded-full bg-muted' : 'h-2.5 overflow-hidden rounded-full bg-muted'}
      >
        <div className="ribbon h-full rounded-full" style={{ width: `${value}%` }} suppressHydrationWarning />
      </div>
    </div>
  );
}

function YearProgressPage() {
  const now = useNow(1000);
  const hydrated = useHydrated();
  const timeZone = hydrated ? browserTimeZone() : 'UTC';

  const p = zonedParts(now, timeZone);
  const at = (year: number, month: number, day: number) => zonedToUtc(year, month, day, 0, 0, timeZone).getTime();
  const percent = (start: number, end: number) => ((now.getTime() - start) / (end - start)) * 100;

  const quarter = Math.floor((p.month - 1) / 3);
  const quarterStart = quarter * 3 + 1;
  const mondayOffset = (p.weekday + 6) % 7;

  const yearStart = at(p.year, 1, 1);
  const yearEnd = at(p.year + 1, 1, 1);
  const dayMs = 86_400_000;
  const dayOfYear = Math.floor((at(p.year, p.month, p.day) - yearStart) / dayMs + 0.5) + 1;
  const daysInYear = Math.round((yearEnd - yearStart) / dayMs);

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{p.year} year progress</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">How much of the year has gone, and how much is left.</p>
      </div>

      <section className="space-y-6 rounded-3xl border bg-card p-6 shadow-xs sm:p-8">
        <Progress label={String(p.year)} value={percent(yearStart, yearEnd)} digits={4} big />
        <div className="grid gap-5 sm:grid-cols-2">
          <Progress label={`Quarter ${quarter + 1}`} value={percent(at(p.year, quarterStart, 1), at(p.year, quarterStart + 3, 1))} />
          <Progress label="This month" value={percent(at(p.year, p.month, 1), at(p.year, p.month + 1, 1))} />
          <Progress label="This week" value={percent(at(p.year, p.month, p.day - mondayOffset), at(p.year, p.month, p.day - mondayOffset + 7))} />
          <Progress label="Today" value={percent(at(p.year, p.month, p.day), at(p.year, p.month, p.day + 1))} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Day of the year" value={dayOfYear} hint={`of ${daysInYear}`} />
        <StatCard label="Days left" value={daysInYear - dayOfYear} />
        <StatCard label="Weeks left" value={Math.floor((daysInYear - dayOfYear) / 7)} />
        <StatCard label="Months left" value={12 - p.month} hint="After this one" />
      </div>

      <p className="text-sm text-muted-foreground">
        Make the rest of the year count: find the{' '}
        <Link to="/leave-planner" className="text-primary hover:underline">best days to take off</Link>, or see the{' '}
        <Link to="/calendar/$year" params={{ year: String(p.year) }} className="text-primary hover:underline">
          {p.year} calendar
        </Link>
        .
      </p>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
