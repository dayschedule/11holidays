import {
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  eachDayOfInterval,
  isWeekend,
  subMonths,
  subYears,
} from 'date-fns';

export interface Span {
  years: number;
  months: number;
  days: number;
}

/** Whole years, months and days from `from` to `to`, the way people state an age */
export function dateSpan(from: Date, to: Date): Span {
  const [start, end] = from <= to ? [from, to] : [to, from];
  const years = differenceInYears(end, start);
  const afterYears = subYears(end, years);
  const months = differenceInMonths(afterYears, start);
  const days = differenceInCalendarDays(subMonths(afterYears, months), start);
  return { years, months, days };
}

export function formatSpan({ years, months, days }: Span) {
  const parts = [
    years && `${years} year${years === 1 ? '' : 's'}`,
    months && `${months} month${months === 1 ? '' : 's'}`,
    days && `${days} day${days === 1 ? '' : 's'}`,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '0 days';
}

/** Monday to Friday days between two dates, both inclusive */
export function countWeekdays(from: Date, to: Date) {
  const [start, end] = from <= to ? [from, to] : [to, from];
  return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d)).length;
}
