import { z } from 'zod';
import { CALENDAR_THEME_KEYS, type CalendarHoliday } from './calendar-utils';
import { toSlug } from './countries-data';
import { holidayKind, type Holiday } from './holidays-api';

/**
 * Calendar customisations live in the URL so a calendar can be shared,
 * embedded or saved simply by keeping its search params.
 */
export const calendarSearchSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined),
  view: z.enum(['year', 'month', 'list']).optional().catch(undefined),
  month: z.coerce.number().int().min(0).max(11).optional().catch(undefined),
  theme: z.enum(CALENDAR_THEME_KEYS).optional().catch(undefined),
  title: z.string().max(80).optional().catch(undefined),
  week: z.enum(['sun', 'mon']).optional().catch(undefined),
  only: z.enum(['all', 'public']).optional().catch(undefined),
  /** Excluded holidays, by name slug */
  ex: z.string().optional().catch(undefined),
  /** Included holidays, by name slug (used instead of `ex` when shorter) */
  inc: z.string().optional().catch(undefined),
  /** Custom entries: "yyyy-MM-dd~Name|yyyy-MM-dd~Name" */
  add: z.string().optional().catch(undefined),
});

export type CalendarSearch = z.infer<typeof calendarSearchSchema>;

/** The subset of params that decides which holidays are shown */
type SelectionSearch = Pick<CalendarSearch, 'ex' | 'inc' | 'only' | 'add'>;

export interface CustomEntry {
  date: string;
  name: string;
}

export function parseCustomEntries(add?: string): CustomEntry[] {
  if (!add) return [];
  return add
    .split('|')
    .map((part) => {
      const [date = '', ...name] = part.split('~');
      return { date, name: name.join('~').trim() };
    })
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.name);
}

export function serializeCustomEntries(entries: CustomEntry[]) {
  if (!entries.length) return undefined;
  return entries
    .map((e) => `${e.date}~${e.name.replace(/[|~]/g, ' ')}`)
    .join('|');
}

export const holidayKey = (h: Pick<Holiday, 'name'>) => toSlug(h.name);

/** Returns the set of excluded keys from either `ex` or `inc` */
export function getExcludedKeys(search: SelectionSearch, holidays: Holiday[]): Set<string> {
  const allKeys = holidays.map(holidayKey);
  if (search.inc !== undefined) {
    const included = new Set(search.inc.split(',').filter(Boolean));
    return new Set(allKeys.filter((k) => !included.has(k)));
  }
  const excluded = new Set((search.ex ?? '').split(',').filter(Boolean));
  if (search.only === 'public') {
    holidays.forEach((h) => {
      if (holidayKind(h.type) !== 'public') excluded.add(holidayKey(h));
    });
  }
  return excluded;
}

/** Encodes a selection using whichever of `ex` / `inc` is shorter */
export function encodeSelection(excluded: Set<string>, holidays: Holiday[]) {
  const allKeys = Array.from(new Set(holidays.map(holidayKey)));
  const ex = allKeys.filter((k) => excluded.has(k));
  const inc = allKeys.filter((k) => !excluded.has(k));
  if (!ex.length) return { ex: undefined, inc: undefined };
  return ex.join(',').length <= inc.join(',').length + 4
    ? { ex: ex.join(','), inc: undefined }
    : { ex: undefined, inc: inc.join(',') };
}

/** The final list of entries shown on the calendar */
export function buildCalendarHolidays(
  holidays: Holiday[],
  search: SelectionSearch
): CalendarHoliday[] {
  const excluded = getExcludedKeys(search, holidays);
  const base: CalendarHoliday[] = holidays
    .filter((h) => !excluded.has(holidayKey(h)))
    .map((h) => ({
      id: String(h.holiday_id),
      date: h.date,
      name: h.name,
      type: h.type,
      url: h.url,
    }));

  const custom: CalendarHoliday[] = parseCustomEntries(search.add).map((e, i) => ({
    id: `custom-${i}`,
    date: e.date,
    name: e.name,
    type: 'Custom',
    custom: true,
  }));

  return [...base, ...custom].sort((a, b) => a.date.localeCompare(b.date));
}

/** Search params with defaults removed, so URLs stay short */
export function cleanSearch<T extends Record<string, unknown>>(search: T): T {
  return Object.fromEntries(
    Object.entries(search).filter(([, value]) => value !== undefined && value !== '')
  ) as T;
}

export function toQueryString(search: Record<string, unknown>) {
  const params = new URLSearchParams();
  Object.entries(cleanSearch(search)).forEach(([k, v]) => params.set(k, String(v)));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/* ------------------------------------------------------------------ */
/* Saved calendars (per browser)                                        */
/* ------------------------------------------------------------------ */

export interface SavedCalendar {
  id: string;
  name: string;
  countrySlug: string;
  countryCode: string;
  search: CalendarSearch;
  updatedAt: string;
}

const STORAGE_KEY = '11holidays:saved-calendars';

export function loadSavedCalendars(): SavedCalendar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedCalendar[]) : [];
  } catch {
    return [];
  }
}

export function storeSavedCalendars(calendars: SavedCalendar[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));
    window.dispatchEvent(new Event('saved-calendars'));
  } catch {
    // storage unavailable (private mode etc.)
  }
}

export function upsertSavedCalendar(calendar: Omit<SavedCalendar, 'id' | 'updatedAt'> & { id?: string }) {
  const all = loadSavedCalendars();
  const id = calendar.id ?? crypto.randomUUID();
  const entry: SavedCalendar = { ...calendar, id, updatedAt: new Date().toISOString() };
  const next = [entry, ...all.filter((c) => c.id !== id)];
  storeSavedCalendars(next);
  return entry;
}

export function deleteSavedCalendar(id: string) {
  storeSavedCalendars(loadSavedCalendars().filter((c) => c.id !== id));
}
