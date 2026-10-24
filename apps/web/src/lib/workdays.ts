import { addDays, differenceInCalendarDays, eachDayOfInterval, format, getDay, parseISO } from 'date-fns';
import { holidayKind, type Holiday } from './holidays-api';

/** Day of week numbers as returned by `getDay` (0 = Sunday … 6 = Saturday) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const DEFAULT_WEEKEND: Weekday[] = [6, 0];

// Countries whose official weekend is not Saturday + Sunday
const WEEKENDS: Record<string, Weekday[]> = {
  DZ: [5, 6],
  BH: [5, 6],
  BD: [5, 6],
  EG: [5, 6],
  IQ: [5, 6],
  IL: [5, 6],
  JO: [5, 6],
  KW: [5, 6],
  LY: [5, 6],
  MV: [5, 6],
  OM: [5, 6],
  QA: [5, 6],
  SA: [5, 6],
  SD: [5, 6],
  SY: [5, 6],
  YE: [5, 6],
  IR: [5],
  DJ: [5],
  NP: [6],
  BN: [5, 0],
};

export function getWeekend(countryCode: string): Weekday[] {
  return WEEKENDS[countryCode.toUpperCase()] ?? DEFAULT_WEEKEND;
}

export function weekendLabel(weekend: Weekday[]) {
  return weekend.length ? weekend.map((d) => WEEKDAY_LABELS[d]).join(' & ') : 'none';
}

const iso = (date: Date) => format(date, 'yyyy-MM-dd');

/** Public holidays that close offices, keyed by date. Observances and local holidays don't count. */
export function publicHolidayMap(holidays: Holiday[]) {
  const map = new Map<string, string[]>();
  for (const h of holidays) {
    if (holidayKind(h.type) !== 'public') continue;
    const names = map.get(h.date) ?? [];
    if (!names.includes(h.name)) names.push(h.name);
    map.set(h.date, names);
  }
  return map;
}

export type DayKind = 'work' | 'weekend' | 'holiday';

export interface WorkdayContext {
  weekend: Weekday[];
  holidays: Map<string, string[]>;
}

export function dayKind(date: Date, { weekend, holidays }: WorkdayContext): DayKind {
  if (weekend.includes(getDay(date) as Weekday)) return 'weekend';
  if (holidays.has(iso(date))) return 'holiday';
  return 'work';
}

export interface RangeSummary {
  calendarDays: number;
  workingDays: number;
  weekendDays: number;
  /** Public holidays that fall on working days */
  holidayDays: number;
  holidays: { date: string; names: string[] }[];
}

/** Counts working days between two dates, both inclusive */
export function summarizeRange(start: Date, end: Date, ctx: WorkdayContext): RangeSummary {
  const [from, to] = start <= end ? [start, end] : [end, start];
  const summary: RangeSummary = { calendarDays: 0, workingDays: 0, weekendDays: 0, holidayDays: 0, holidays: [] };

  for (const day of eachDayOfInterval({ start: from, end: to })) {
    summary.calendarDays++;
    const kind = dayKind(day, ctx);
    if (kind === 'work') summary.workingDays++;
    else if (kind === 'weekend') summary.weekendDays++;
    else {
      summary.holidayDays++;
      summary.holidays.push({ date: iso(day), names: ctx.holidays.get(iso(day))! });
    }
  }
  return summary;
}

/** Moves forward (or backward for negative `days`) by a number of working days */
export function addWorkingDays(start: Date, days: number, ctx: WorkdayContext): Date {
  const step = days < 0 ? -1 : 1;
  let remaining = Math.abs(days);
  let date = start;
  // guard against a weekend that covers the whole week
  for (let guard = 0; remaining > 0 && guard < 5000; guard++) {
    date = addDays(date, step);
    if (dayKind(date, ctx) === 'work') remaining--;
  }
  return date;
}

export interface MonthSummary extends RangeSummary {
  month: number;
  label: string;
}

export function summarizeYear(year: number, ctx: WorkdayContext): MonthSummary[] {
  return Array.from({ length: 12 }, (_, month) => ({
    month,
    label: format(new Date(year, month, 1), 'MMMM'),
    ...summarizeRange(new Date(year, month, 1), new Date(year, month + 1, 0), ctx),
  }));
}

/* ------------------------------------------------------------------ */
/* Leave planner                                                        */
/* ------------------------------------------------------------------ */

export interface Break {
  start: string;
  end: string;
  days: number;
  /** Working days that need a leave */
  leaves: string[];
  holidays: { date: string; names: string[] }[];
}

const MAX_LEAVES_PER_BREAK = 9;

/**
 * Picks the breaks that turn a leave budget into the most days off.
 * Every candidate break bridges at least one public holiday that falls on a working day
 * and is padded with the weekends and holidays around it. The combination of breaks with
 * the most days off within the budget is chosen exactly.
 */
export function planLeaves(from: Date, to: Date, budget: number, ctx: WorkdayContext): Break[] {
  const days = eachDayOfInterval({ start: from, end: to });
  const kinds = days.map((d) => dayKind(d, ctx));
  const n = days.length;

  const candidates: { s: number; e: number; cost: number }[] = [];

  const maxCost = Math.min(budget, MAX_LEAVES_PER_BREAK);

  for (let i = 0; i < n; i++) {
    if (kinds[i] !== 'work') continue;
    const startsAfterDayOff = i === 0 || kinds[i - 1] !== 'work';

    let cost = 0;
    for (let j = i; j < n; j++) {
      if (kinds[j] !== 'work') continue;
      if (++cost > maxCost) break;
      // leave days must touch a day off on at least one side, e.g. the Tuesday after a Monday holiday
      const endsBeforeDayOff = j === n - 1 || kinds[j + 1] !== 'work';
      if (!startsAfterDayOff && !endsBeforeDayOff) continue;

      let s = i;
      let e = j;
      while (s > 0 && kinds[s - 1] !== 'work') s--;
      while (e + 1 < n && kinds[e + 1] !== 'work') e++;

      let bridgesHoliday = false;
      for (let k = s; k <= e; k++) if (kinds[k] === 'holiday') bridgesHoliday = true;
      if (!bridgesHoliday) continue;

      candidates.push({ s, e, cost });
    }
  }

  // Weighted interval scheduling with a leave budget: dp[k][b] is the best plan using the first k
  // candidates (sorted by end) and at most b leaves. Most days off wins, then fewer leaves.
  candidates.sort((a, b) => a.e - b.e);
  const C = candidates.length;
  const value = (days: number, leaves: number) => days * 1000 - leaves;

  // last candidate that ends with at least one working day before candidate k starts
  const prev = candidates.map((c) => {
    let lo = 0;
    let hi = C;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (candidates[mid]!.e < c.s - 1) lo = mid + 1;
      else hi = mid;
    }
    return lo - 1;
  });

  const dp: number[][] = [new Array(budget + 1).fill(0)];
  const take: boolean[][] = [];
  for (let k = 0; k < C; k++) {
    const c = candidates[k]!;
    const row = dp[k]!.slice();
    const took = new Array<boolean>(budget + 1).fill(false);
    for (let b = c.cost; b <= budget; b++) {
      const withIt = dp[prev[k]! + 1]![b - c.cost]! + value(c.e - c.s + 1, c.cost);
      if (withIt > row[b]!) {
        row[b] = withIt;
        took[b] = true;
      }
    }
    dp.push(row);
    take.push(took);
  }

  const taken: { s: number; e: number }[] = [];
  for (let k = C - 1, b = budget; k >= 0; ) {
    if (take[k]![b]) {
      const c = candidates[k]!;
      taken.push(c);
      b -= c.cost;
      k = prev[k]!;
    } else k--;
  }

  return taken
    .sort((a, b) => a.s - b.s)
    .map(({ s, e }) => {
      const range = days.slice(s, e + 1);
      return {
        start: iso(days[s]!),
        end: iso(days[e]!),
        days: e - s + 1,
        leaves: range.filter((_, k) => kinds[s + k] === 'work').map(iso),
        holidays: range
          .filter((_, k) => kinds[s + k] === 'holiday')
          .map((d) => ({ date: iso(d), names: ctx.holidays.get(iso(d))! })),
      };
    });
}

/** Whole days from today until a date, never negative */
export function daysUntil(date: string, today = new Date()) {
  return Math.max(0, differenceInCalendarDays(parseISO(date), today));
}
