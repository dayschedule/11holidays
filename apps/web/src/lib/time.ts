/**
 * Time zone maths on top of Intl, so conversions always use the runtime's tz database and need no
 * library. Text is built from numeric parts because ICU versions disagree on spacing and
 * abbreviations, and the server and browser must render the same string.
 */

export interface ZonedParts {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
  /** 0-23 */
  hour: number;
  minute: number;
  second: number;
  /** 0 = Sunday */
  weekday: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Building a DateTimeFormat is far slower than using one
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Browser time zone; call it from effects and event handlers only */
export const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function zonedParts(date: Date | number, timeZone: string): ZonedParts {
  const parts: ZonedParts = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0, weekday: 0 };
  for (const { type, value } of formatterFor(timeZone).formatToParts(date)) {
    if (type === 'weekday') parts.weekday = SHORT_WEEKDAY_INDEX[value] ?? 0;
    else if (type in parts) parts[type as keyof ZonedParts] = Number(value);
  }
  return parts;
}

/**
 * Wall-clock parts at a known UTC offset. Unlike zonedParts this reads no time zone data, so it
 * renders the same on the server and in any browser.
 */
export function partsAtOffset(date: Date | number, offset: number): ZonedParts {
  const t = new Date((typeof date === 'number' ? date : date.getTime()) + offset * MINUTE);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
    second: t.getUTCSeconds(),
    weekday: t.getUTCDay(),
  };
}

/** Minutes ahead of UTC at this instant, for example 330 for India */
export function offsetMinutes(date: Date | number, timeZone: string) {
  const ms = typeof date === 'number' ? date : date.getTime();
  const p = zonedParts(ms, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / MINUTE);
}

/** The instant a wall clock in `timeZone` shows this time. Times skipped by DST move forward. */
export function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const first = wall - offsetMinutes(wall, timeZone) * MINUTE;
  const offset = offsetMinutes(first, timeZone);
  const second = wall - offset * MINUTE;
  // The offset doesn't hold at the result only when this wall time doesn't exist
  return new Date(offsetMinutes(second, timeZone) === offset ? second : Math.max(first, second));
}

export function formatOffset(minutes: number) {
  if (minutes === 0) return 'UTC+00:00';
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `UTC${minutes > 0 ? '+' : '-'}${hh}:${mm}`;
}

/** 330 -> "5h 30m", 60 -> "1h" */
export function formatDuration(minutes: number) {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h && m) return `${h}h ${m}m`;
  return h ? `${h}h` : `${m}m`;
}

/** "5h 30m ahead", "Same time" */
export function formatDifference(minutes: number) {
  if (minutes === 0) return 'Same time';
  return `${formatDuration(minutes)} ${minutes > 0 ? 'ahead' : 'behind'}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatClock(p: Pick<ZonedParts, 'hour' | 'minute' | 'second'>, hour12 = false, seconds = false) {
  const tail = seconds ? `:${pad(p.second)}` : '';
  if (!hour12) return `${pad(p.hour)}:${pad(p.minute)}${tail}`;
  return `${p.hour % 12 || 12}:${pad(p.minute)}${tail} ${p.hour < 12 ? 'AM' : 'PM'}`;
}

/** "Saturday, 7 November 2026" */
export const formatLongDate = (p: ZonedParts) =>
  `${WEEKDAYS[p.weekday]}, ${p.day} ${MONTHS[p.month - 1]} ${p.year}`;

/** "Sat, 7 Nov" */
export const formatShortDate = (p: ZonedParts) =>
  `${WEEKDAYS[p.weekday]!.slice(0, 3)}, ${p.day} ${MONTHS[p.month - 1]!.slice(0, 3)}`;

/** "yyyy-MM-dd" as seen in that zone */
export const isoDate = (p: Pick<ZonedParts, 'year' | 'month' | 'day'>) => `${p.year}-${pad(p.month)}-${pad(p.day)}`;

/** Calendar days between two zoned dates: 1 when `b` is on the next day */
export function dayDifference(a: ZonedParts, b: ZonedParts) {
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY);
}

export interface OffsetChange {
  /** First instant of the new offset */
  at: Date;
  from: number;
  to: number;
}

/** Every offset change in a year, found by probing weekly and bisecting down to the minute */
export function offsetChanges(timeZone: string, year: number): OffsetChange[] {
  const end = Date.UTC(year + 1, 0, 1);
  const changes: OffsetChange[] = [];

  let lo = Date.UTC(year, 0, 1);
  let loOffset = offsetMinutes(lo, timeZone);
  while (lo < end) {
    const hi = Math.min(lo + 7 * DAY, end);
    const hiOffset = offsetMinutes(hi, timeZone);
    if (hiOffset !== loOffset) {
      let a = lo;
      let b = hi;
      while (b - a > MINUTE) {
        const mid = a + Math.floor((b - a) / 2 / MINUTE) * MINUTE;
        if (offsetMinutes(mid, timeZone) === loOffset) a = mid;
        else b = mid;
      }
      changes.push({ at: new Date(b), from: loOffset, to: hiOffset });
    }
    lo = hi;
    loOffset = hiOffset;
  }
  return changes;
}

/** Next offset change after `date`, looking at most into next year */
export function nextOffsetChange(timeZone: string, date: Date) {
  const year = date.getUTCFullYear();
  return [...offsetChanges(timeZone, year), ...offsetChanges(timeZone, year + 1)].find((c) => c.at > date);
}

export type DayPhase = 'night' | 'edge' | 'work';

/** How friendly an hour is for a call: office hours, the edges of the day, or night */
export function dayPhase(hour: number, workStart = 9, workEnd = 17): DayPhase {
  if (hour >= workStart && hour < workEnd) return 'work';
  if (hour >= 7 && hour < 22) return 'edge';
  return 'night';
}
