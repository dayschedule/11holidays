import { notFound } from '@tanstack/react-router';
import { format, getISOWeeksInYear, isLeapYear } from 'date-fns';
import { z } from 'zod';
import { CALENDAR_THEME_KEYS, getMonthName, type CalendarHoliday } from './calendar-utils';
import { holidayKind, type Holiday } from './holidays-api';

export const MIN_YEAR = 2000;
export const MAX_YEAR = 2100;

export const MONTH_SLUGS = Array.from({ length: 12 }, (_, m) => getMonthName(m).toLowerCase());

export const yearCalendarSearch = z.object({
  country: z.string().length(2).optional().catch(undefined),
  week: z.enum(['mon']).optional().catch(undefined),
  theme: z.enum(CALENDAR_THEME_KEYS).optional().catch(undefined),
  show: z.enum(['all', 'none']).optional().catch(undefined),
});

export type YearCalendarSearch = z.infer<typeof yearCalendarSearch>;

export function parseYear(value: string) {
  const year = Number(value);
  if (!/^\d{4}$/.test(value) || year < MIN_YEAR || year > MAX_YEAR) throw notFound();
  return year;
}

export function parseMonth(value: string) {
  const month = MONTH_SLUGS.indexOf(value.toLowerCase());
  if (month < 0) throw notFound();
  return month;
}

/** Public holidays by default so printed calendars stay readable; regional duplicates are merged */
export function calendarHolidays(holidays: Holiday[], show: YearCalendarSearch['show']): CalendarHoliday[] {
  if (show === 'none') return [];
  const seen = new Set<string>();
  return holidays.flatMap((h) => {
    const key = `${h.date}|${h.name}`;
    if (seen.has(key) || (show !== 'all' && holidayKind(h.type) !== 'public')) return [];
    seen.add(key);
    return [{ id: String(h.holiday_id), date: h.date, name: h.name, type: h.type, url: h.url }];
  });
}

export function yearFacts(year: number) {
  return {
    days: isLeapYear(new Date(year, 0, 1)) ? 366 : 365,
    leap: isLeapYear(new Date(year, 0, 1)),
    isoWeeks: getISOWeeksInYear(new Date(year, 5, 1)),
    jan1: format(new Date(year, 0, 1), 'EEEE'),
    dec31: format(new Date(year, 11, 31), 'EEEE'),
  };
}
