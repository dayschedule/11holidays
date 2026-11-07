import { Link, createFileRoute } from '@tanstack/react-router';
import { addWeeks, format, getISOWeek, getISOWeeksInYear, getISOWeekYear, setISOWeek, startOfISOWeek } from 'date-fns';
import { z } from 'zod';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToday } from '@/hooks/use-today';
import { currentYear } from '@/lib/holidays-api';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { faqSchema, seo, softwareAppSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';

const FAQ = [
  {
    q: 'What week number is it today?',
    a: 'The number at the top of this page is the current ISO week, based on the date on your device.',
  },
  {
    q: 'How are week numbers calculated?',
    a: 'This page uses ISO 8601, the standard across Europe and much of Asia. Weeks start on Monday, and week 1 is the week that contains the first Thursday of the year, which is also the week containing 4 January.',
  },
  {
    q: 'Why do some years have 53 weeks?',
    a: 'A year has 52 weeks and one or two days left over, so every five or six years the leftover days add up to an extra ISO week. It happens when a year starts on a Thursday, or a leap year starts on a Wednesday.',
  },
  {
    q: 'Can 1 January be in week 52 or 53?',
    a: 'Yes. If 1 January falls on a Friday, Saturday or Sunday, it belongs to the last week of the previous year in the ISO system.',
  },
  {
    q: 'How do I plan what happens each week?',
    a: 'The free timetable generator on DaySchedule builds a weekly schedule for school, study or shifts that you can download.',
    more: { label: 'Open the timetable generator', href: dayscheduleUrl('/tools/timetable-generator') },
  },
];

export const Route = createFileRoute('/_site/week-number')({
  validateSearch: z.object({ year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined) }),
  head: ({ match }) => {
    const year = match.search.year ?? currentYear();
    return seo({
      title: `What Week Is It? Current Week Number & ${year} Week List | 11holidays`,
      description: `Find the current ISO week number and see every week of ${year} with its start and end dates. Week numbers start on Monday, following ISO 8601.`,
      keywords: ['week number', 'what week is it', 'current week number', `week numbers ${year}`, 'iso week', 'calendar week'],
      path: '/week-number',
      noindex: Boolean(match.search.year),
      jsonLd: [
        softwareAppSchema('Week number', '/week-number', 'The current ISO week number and all week dates of the year.'),
        faqSchema(FAQ),
      ],
    });
  },
  component: WeekNumberPage,
});

function WeekNumberPage() {
  const search = Route.useSearch();
  const today = useToday();

  const week = getISOWeek(today);
  const weekYear = getISOWeekYear(today);
  const year = search.year ?? weekYear;
  const total = getISOWeeksInYear(new Date(year, 5, 1));
  const first = startOfISOWeek(setISOWeek(new Date(year, 0, 4), 1));

  const weeks = Array.from({ length: total }, (_, i) => {
    const start = addWeeks(first, i);
    return { number: i + 1, start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6) };
  });

  return (
    <PageLayout sidebar={false}>
      <section className="rounded-3xl border bg-card p-6 text-center shadow-xs sm:p-10">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Current week number</p>
        <h1 className="mt-1 text-6xl font-bold tracking-tight sm:text-8xl">
          <span className="sr-only">Week number today: </span>Week {week}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {format(startOfISOWeek(today), 'EEE, d MMM')} to{' '}
          {format(new Date(startOfISOWeek(today).getTime() + 6 * 86_400_000), 'EEE, d MMM yyyy')}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">
            All {total} weeks of {year}
          </h2>
          <div className="flex gap-2">
            {[weekYear - 1, weekYear, weekYear + 1].map((y) => (
              <Button key={y} size="sm" variant={y === year ? 'default' : 'outline'} asChild>
                <Link to="/week-number" search={y === weekYear ? {} : { year: y }} resetScroll={false}>
                  {y}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Week</TableHead>
                <TableHead>Monday</TableHead>
                <TableHead>Sunday</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map((w) => {
                const current = year === weekYear && w.number === week;
                return (
                  <TableRow key={w.number} className={cn(current && 'bg-primary/10 font-semibold')}>
                    <TableCell className="tabular-nums">{w.number}</TableCell>
                    <TableCell className="tabular-nums">{format(w.start, 'd MMM yyyy')}</TableCell>
                    <TableCell className="tabular-nums">{format(w.end, 'd MMM yyyy')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
