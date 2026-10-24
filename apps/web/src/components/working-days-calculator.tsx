import { useEffect, useMemo, useState } from 'react';
import { addDays, eachYearOfInterval, format, isValid, parseISO, subDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Country } from '@/lib/countries-data';
import type { Holiday } from '@/lib/holidays-api';
import { cn } from '@/lib/utils';
import {
  WEEKDAY_LABELS,
  addWorkingDays,
  getWeekend,
  publicHolidayMap,
  summarizeRange,
  weekendLabel,
  type Weekday,
} from '@/lib/workdays';
import { getCountryHolidays } from '@/server/holidays';

interface WorkingDaysCalculatorProps {
  country: Country;
  /** Holidays already loaded by the route, keyed by year */
  initialHolidays: Record<number, Holiday[]>;
}

const MAX_YEARS = 10;

export function WorkingDaysCalculator({ country, initialHolidays }: WorkingDaysCalculatorProps) {
  const [mode, setMode] = useState<'between' | 'add'>('between');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [amount, setAmount] = useState(10);
  const [includeEnd, setIncludeEnd] = useState(true);
  const [weekend, setWeekend] = useState<Weekday[]>(() => getWeekend(country.code));
  const [byYear, setByYear] = useState(initialHolidays);
  const [loading, setLoading] = useState(false);

  // dates depend on "today", so set them after hydration
  useEffect(() => {
    const today = new Date();
    setStart(format(today, 'yyyy-MM-dd'));
    setEnd(format(addDays(today, 30), 'yyyy-MM-dd'));
  }, []);

  useEffect(() => {
    setWeekend(getWeekend(country.code));
    setByYear(initialHolidays);
  }, [country.code, initialHolidays]);

  const from = parseISO(start);
  const to = parseISO(end);
  const valid = isValid(from) && (mode === 'add' || isValid(to));

  // years the calculation touches; "add" mode can run past the end date, so look one year ahead
  const years = useMemo(() => {
    if (!valid) return [];
    const last = mode === 'add' ? addDays(from, Math.abs(amount) * 2 + 30) : to;
    const first = mode === 'add' && amount < 0 ? subDays(from, Math.abs(amount) * 2 + 30) : from;
    const [a, b] = first <= last ? [first, last] : [last, first];
    return eachYearOfInterval({ start: a, end: b })
      .map((d) => d.getFullYear())
      .slice(0, MAX_YEARS);
  }, [valid, mode, start, end, amount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const missing = years.filter((y) => !byYear[y] && y >= 2000 && y <= 2100);
    if (!missing.length) return;
    let cancelled = false;
    setLoading(true);
    Promise.all(missing.map((year) => getCountryHolidays({ data: { code: country.code, year } })))
      .then((results) => {
        if (cancelled) return;
        setByYear((prev) => ({ ...prev, ...Object.fromEntries(results.map((r) => [r.year, r.holidays])) }));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [years, byYear, country.code]);

  const ctx = useMemo(() => ({ weekend, holidays: publicHolidayMap(Object.values(byYear).flat()) }), [weekend, byYear]);

  const tooLong = valid && mode === 'between' && Math.abs(to.getTime() - from.getTime()) > MAX_YEARS * 366 * 86400000;

  const summary = useMemo(() => {
    if (!valid || mode !== 'between' || tooLong) return null;
    const last = includeEnd ? to : from <= to ? subDays(to, 1) : addDays(to, 1);
    return summarizeRange(from, last, ctx);
  }, [valid, mode, tooLong, start, end, includeEnd, ctx]); // eslint-disable-line react-hooks/exhaustive-deps

  const resultDate = useMemo(
    () => (valid && mode === 'add' && weekend.length < 7 ? addWorkingDays(from, amount, ctx) : null),
    [valid, mode, start, amount, ctx, weekend.length] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const toggleDay = (d: Weekday) =>
    setWeekend((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d].sort() as Weekday[]));

  return (
    <div className="grid gap-6 rounded-2xl border bg-card p-4 shadow-xs sm:p-6 md:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-lg border p-1">
          {(
            [
              ['between', 'Days between dates'],
              ['add', 'Add working days'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn('rounded-md px-3 py-1.5 text-xs font-medium', mode === value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="wd-start" className="text-xs">Start date</Label>
            <Input id="wd-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          {mode === 'between' ? (
            <div className="space-y-1.5">
              <Label htmlFor="wd-end" className="text-xs">End date</Label>
              <Input id="wd-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="wd-amount" className="text-xs">Working days (+/−)</Label>
              <Input
                id="wd-amount"
                type="number"
                min={-2000}
                max={2000}
                value={amount}
                onChange={(e) => setAmount(Math.max(-2000, Math.min(2000, Number(e.target.value) || 0)))}
              />
            </div>
          )}
        </div>

        {mode === 'between' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeEnd} onChange={(e) => setIncludeEnd(e.target.checked)} className="accent-primary" />
            Include the end date
          </label>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs">Weekend days ({country.name} default: {weekendLabel(getWeekend(country.code))})</Label>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label, d) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(d as Weekday)}
                aria-pressed={weekend.includes(d as Weekday)}
                className={cn(
                  'rounded-md border py-1.5 text-xs font-medium',
                  weekend.includes(d as Weekday) ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Public holidays in {country.name} are excluded automatically. Observances and regional holidays are counted as
          working days.
        </p>
      </div>

      <div className="flex flex-col justify-center rounded-xl bg-muted/50 p-5" aria-live="polite">
        {loading && (
          <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading holidays…
          </p>
        )}
        {tooLong && <p className="text-sm text-muted-foreground">Pick a range of {MAX_YEARS} years or less.</p>}
        {summary && (
          <>
            <p className="text-sm text-muted-foreground">Working days</p>
            <p className="text-5xl font-bold tabular-nums text-primary">{summary.workingDays}</p>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              {[
                ['Calendar days', summary.calendarDays],
                ['Weekend days', summary.weekendDays],
                ['Public holidays', summary.holidayDays],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-background p-2">
                  <dd className="text-xl font-semibold tabular-nums">{value}</dd>
                  <dt className="text-[11px] text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
            {summary.holidays.length > 0 && (
              <ul className="mt-4 max-h-40 space-y-1 overflow-auto text-xs">
                {summary.holidays.map((h) => (
                  <li key={h.date} className="flex justify-between gap-2">
                    <span className="truncate">{h.names.join(', ')}</span>
                    <span className="shrink-0 text-muted-foreground">{format(parseISO(h.date), 'EEE d MMM yyyy')}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {mode === 'add' && resultDate && (
          <>
            <p className="text-sm text-muted-foreground">
              {Math.abs(amount)} working day{Math.abs(amount) === 1 ? '' : 's'} {amount < 0 ? 'before' : 'after'}{' '}
              {format(from, 'd MMM yyyy')}
            </p>
            <p className="text-3xl font-bold text-primary">{format(resultDate, 'EEEE, d MMMM yyyy')}</p>
          </>
        )}
      </div>
    </div>
  );
}
