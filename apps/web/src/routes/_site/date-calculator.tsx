import { useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { add, differenceInCalendarDays, format, isValid, parseISO, sub } from 'date-fns';
import { FaqSection } from '@/components/faq-section';
import { PageLayout } from '@/components/page-layout';
import { StatCard } from '@/components/time/time-ui';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToday } from '@/hooks/use-today';
import { countWeekdays, dateSpan, formatSpan } from '@/lib/date-math';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { faqSchema, seo, softwareAppSchema } from '@/lib/seo';

const FAQ = [
  {
    q: 'How do I count the days between two dates?',
    a: 'Enter a start and end date and the calculator shows the total days, weeks and weekdays, plus the same span in years, months and days. Turn on Include end date to count both the first and last day.',
  },
  {
    q: 'How do I add days to a date?',
    a: 'Switch to Add or subtract, pick a start date, then enter a number of days, weeks, months or years. The result shows the new date and its day of the week.',
  },
  {
    q: 'Does this exclude public holidays?',
    a: 'The weekday count here leaves out Saturdays and Sundays only. To also leave out the public holidays of a country, use the working days calculator.',
  },
  {
    q: 'Can I calculate an age from a date of birth?',
    a: 'Yes. The free age calculator on DaySchedule shows an exact age in years, months and days.',
    more: { label: 'Open the age calculator', href: dayscheduleUrl('/tools/age-calculator') },
  },
];

export const Route = createFileRoute('/_site/date-calculator')({
  head: () =>
    seo({
      title: 'Date Calculator - Days Between Dates, Add or Subtract Days | 11holidays',
      description:
        'Free date calculator. Count the days, weeks and months between two dates, or add and subtract days, weeks, months and years from any date.',
      keywords: ['date calculator', 'days between dates', 'how many days until', 'add days to date', 'date duration calculator', 'day counter'],
      path: '/date-calculator',
      jsonLd: [
        softwareAppSchema('Date calculator', '/date-calculator', 'Count the days between two dates, or add and subtract days, weeks, months and years.'),
        faqSchema(FAQ),
      ],
    }),
  component: DateCalculatorPage,
});

const parse = (value: string) => {
  const date = parseISO(value);
  return isValid(date) ? date : null;
};

function BetweenDates({ today }: { today: string }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [inclusive, setInclusive] = useState(false);

  const startValue = start || today;
  const endValue = end || `${today.slice(0, 4)}-12-31`;
  const from = parse(startValue);
  const to = parse(endValue);
  const extra = inclusive ? 1 : 0;
  const days = from && to ? Math.abs(differenceInCalendarDays(to, from)) + extra : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dc-start" className="text-xs">Start date</Label>
          <Input id="dc-start" type="date" value={startValue} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc-end" className="text-xs">End date</Label>
          <Input id="dc-end" type="date" value={endValue} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={inclusive} onCheckedChange={(v) => setInclusive(v === true)} /> Include end date
      </label>
      {from && to && (
        <>
          <p className="text-lg">
            <strong className="font-semibold">{formatSpan(dateSpan(from, to))}</strong>
            <span className="text-muted-foreground">
              {' '}from {format(from, 'EEE, d MMM yyyy')} to {format(to, 'EEE, d MMM yyyy')}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Days" value={days.toLocaleString('en-US')} />
            <StatCard
              label="Weeks"
              value={Math.floor(days / 7).toLocaleString('en-US')}
              hint={days % 7 ? `and ${days % 7} day${days % 7 === 1 ? '' : 's'}` : undefined}
            />
            <StatCard label="Weekdays" value={countWeekdays(from, to).toLocaleString('en-US')} hint="Mon to Fri, both dates" />
            <StatCard label="Hours" value={(days * 24).toLocaleString('en-US')} />
          </div>
        </>
      )}
    </div>
  );
}

const UNITS = ['days', 'weeks', 'months', 'years'] as const;

function AddSubtract({ today }: { today: string }) {
  const [start, setStart] = useState('');
  const [amount, setAmount] = useState('30');
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('days');
  const [mode, setMode] = useState<'add' | 'subtract'>('add');

  const startValue = start || today;
  const from = parse(startValue);
  const count = Number(amount);
  const valid = from && Number.isFinite(count) && Math.abs(count) <= 100_000;
  const result = valid ? (mode === 'add' ? add : sub)(from, { [unit]: count }) : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_130px_100px_120px]">
        <div className="space-y-1.5">
          <Label htmlFor="dc-from" className="text-xs">Start date</Label>
          <Input id="dc-from" type="date" value={startValue} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Operation</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">Add</SelectItem>
              <SelectItem value="subtract">Subtract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dc-amount" className="text-xs">Amount</Label>
          <Input id="dc-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Unit</Label>
          <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
            <SelectTrigger className="w-full capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u} className="capitalize">
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {result && isValid(result) && (
        <div className="rounded-2xl border bg-muted/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Result</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{format(result, 'EEEE, d MMMM yyyy')}</p>
        </div>
      )}
    </div>
  );
}

function DateCalculatorPage() {
  const today = format(useToday(), 'yyyy-MM-dd');

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Date calculator</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Count the time between two dates, or find the date a number of days, weeks, months or years away.
        </p>
      </div>

      <Tabs defaultValue="between" className="gap-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="between">Days between dates</TabsTrigger>
          <TabsTrigger value="add">Add or subtract</TabsTrigger>
        </TabsList>
        <TabsContent value="between" className="rounded-2xl border bg-card p-4 shadow-xs sm:p-6">
          <BetweenDates today={today} />
        </TabsContent>
        <TabsContent value="add" className="rounded-2xl border bg-card p-4 shadow-xs sm:p-6">
          <AddSubtract today={today} />
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        Need business days? Use the{' '}
        <Link to="/working-days-calculator" className="text-primary hover:underline">working days calculator</Link>, which
        leaves out the public holidays of your country. To watch a date arrive, try the{' '}
        <Link to="/countdown" className="text-primary hover:underline">countdown timer</Link>.
      </p>

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
