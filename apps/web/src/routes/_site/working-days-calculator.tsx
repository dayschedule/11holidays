import { useMemo } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { Briefcase } from 'lucide-react';
import { z } from 'zod';
import { CountrySelect } from '@/components/country-select';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WorkingDaysCalculator } from '@/components/working-days-calculator';
import { getCountryByCode } from '@/lib/countries-data';
import { currentYear } from '@/lib/holidays-api';
import { faqSchema, seo, softwareAppSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { getWeekend, publicHolidayMap, summarizeYear, weekendLabel } from '@/lib/workdays';
import { getVisitorCountry, useVisitorCountry } from '@/lib/visitor-country';
import { getCountryHolidays } from '@/server/holidays';

const FAQ = [
  {
    q: 'How do I calculate working days between two dates?',
    a: 'Pick your country, then enter a start and end date. The calculator counts every day in the range and leaves out weekend days and the public holidays of that country.',
  },
  {
    q: 'How do I add working days to a date?',
    a: 'Switch to "Add working days", enter a start date and the number of business days. Use a negative number to count backwards, for example to find a deadline 10 working days before an event.',
  },
  {
    q: 'Are public holidays excluded?',
    a: 'Yes. National public holidays of the selected country are excluded. Observances and regional holidays are counted as working days because most businesses stay open.',
  },
  {
    q: 'Can I change the weekend days?',
    a: 'Yes. Each country starts with its official weekend, for example Saturday and Sunday in the US or Friday and Saturday in Saudi Arabia. Toggle any day for shift work or a six-day week.',
  },
];

export const Route = createFileRoute('/_site/working-days-calculator')({
  validateSearch: z.object({
    country: z.string().length(2).optional().catch(undefined),
    year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ country: search.country, year: search.year ?? currentYear() }),
  loader: async ({ deps }) => {
    const country = getCountryByCode(deps.country ?? getVisitorCountry()) ?? getCountryByCode('US')!;
    const [current, next] = await Promise.all([
      getCountryHolidays({ data: { code: country.code, year: deps.year } }),
      getCountryHolidays({ data: { code: country.code, year: deps.year + 1 } }),
    ]);
    return { country, year: deps.year, holidays: { [deps.year]: current.holidays, [deps.year + 1]: next.holidays } };
  },
  head: () =>
    seo({
      title: `Working Days Calculator ${currentYear()} - Business Days Between Two Dates | 11holidays`,
      description:
        'Count working days and business days between two dates, or add working days to a date. Excludes weekends and public holidays for 230+ countries, with working days per month.',
      keywords: [
        'working days calculator',
        'business days calculator',
        'working days between two dates',
        'add business days to date',
        `working days in ${currentYear()}`,
        'working days per month',
      ],
      path: '/working-days-calculator',
      jsonLd: [
        softwareAppSchema(
          'Working days calculator',
          '/working-days-calculator',
          'Count business days between two dates excluding weekends and public holidays of any country.'
        ),
        faqSchema(FAQ),
      ],
    }),
  component: WorkingDaysPage,
});

function WorkingDaysPage() {
  const { country, year, holidays } = Route.useLoaderData();
  const search = Route.useSearch();
  useVisitorCountry(country.code, !search.country);
  const navigate = useNavigate({ from: Route.fullPath });

  const weekend = getWeekend(country.code);
  const months = useMemo(
    () => summarizeYear(year, { weekend, holidays: publicHolidayMap(holidays[year] ?? []) }),
    [year, weekend, holidays]
  );
  const total = months.reduce(
    (t, m) => ({
      workingDays: t.workingDays + m.workingDays,
      weekendDays: t.weekendDays + m.weekendDays,
      holidayDays: t.holidayDays + m.holidayDays,
    }),
    { workingDays: 0, weekendDays: 0, holidayDays: 0 }
  );

  return (
    <PageLayout country={country}>
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-festive-pine/15 px-3 py-1 text-xs font-semibold text-festive-pine">
          <Briefcase className="h-3.5 w-3.5" /> Free · 230+ countries
        </span>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Working days calculator</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Count the working days between two dates or find the date a number of business days away. Weekends and public
          holidays are left out automatically.
        </p>
      </div>

      <div className="max-w-xs space-y-1.5">
        <Label className="text-xs">Country</Label>
        <CountrySelect
          value={country.code}
          onChange={(c) => navigate({ search: { ...search, country: c.code.toLowerCase() }, replace: true, resetScroll: false })}
        />
      </div>

      <WorkingDaysCalculator country={country} initialHolidays={holidays} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              Working days in {country.name} in {year}
            </h2>
            <p className="text-sm text-muted-foreground">
              {total.workingDays} working days · {total.holidayDays} public holidays on weekdays · weekend{' '}
              {weekendLabel(weekend)}
            </p>
          </div>
          <div className="flex gap-1 rounded-full border bg-card p-1">
            {[currentYear(), currentYear() + 1].map((y) => (
              <Link
                key={y}
                from={Route.fullPath}
                search={{ ...search, year: y === currentYear() ? undefined : y }}
                replace
                resetScroll={false}
                className={cn('rounded-full px-4 py-1 text-sm font-medium', y === year ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Working days</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Weekend days</TableHead>
                <TableHead className="text-right">Public holidays</TableHead>
                <TableHead className="hidden md:table-cell">Holidays on weekdays</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((m) => (
                <TableRow key={m.month}>
                  <TableCell className="font-medium">{m.label}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{m.workingDays}</TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">{m.weekendDays}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.holidayDays}</TableCell>
                  <TableCell className="hidden max-w-xs whitespace-normal text-xs text-muted-foreground md:table-cell">
                    {m.holidays.map((h) => `${h.names.join(', ')} (${format(parseISO(h.date), 'd MMM')})`).join(' · ')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">Total {year}</TableCell>
                <TableCell className="text-right font-bold tabular-nums">{total.workingDays}</TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">{total.weekendDays}</TableCell>
                <TableCell className="text-right tabular-nums">{total.holidayDays}</TableCell>
                <TableCell className="hidden md:table-cell" />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground">
          Want more time off?{' '}
          <Link
            to="/leave-planner"
            search={{ country: country.code.toLowerCase() }}
            className="font-medium text-primary hover:underline"
          >
            Plan your leaves around {country.name}&apos;s holidays
          </Link>
          .
        </p>
      </section>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
