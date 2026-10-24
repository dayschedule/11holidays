import { addYears, format, startOfYear } from 'date-fns';
import { sampleHolidays } from './sample-data';

export interface Holiday {
  holiday_id: number;
  date: string;
  name: string;
  type: string;
  url?: string;
  year?: number;
  description?: string;
  countryCode?: string;
}

export interface HolidaysResponse {
  holidays: Holiday[];
  country: string;
  year: number;
}

export async function fetchHolidays(
  env: CloudflareEnv,
  countryCode: string,
  year: number
): Promise<HolidaysResponse> {

  if (env.NEXTJS_ENV === 'development') {
    return {
      holidays: sampleHolidays,
      country: countryCode,
      year,
    };
  }

  // Use start - end date to utilize sql index for better query performance
  const baseDate = new Date(year, 0, 1);
  const start = format(startOfYear(baseDate), 'yyyy-MM-dd');
  const end = format(addYears(startOfYear(baseDate), 1), 'yyyy-MM-dd');

  // query executes on either primary database or a read replica for low latency
  const session = env.DB.withSession();
  const sqlQuery = session.prepare(
    `
        SELECT h.holiday_id, o.name, h.date, h.occasion_id, h.country, h.type, 
        CASE
          WHEN o.description IS NOT NULL THEN o.url
          ELSE NULL
        END AS url,
        h.created_at, h.updated_at
        FROM Holidays as h
        Left Join Occasions as o
        ON h.occasion_id = o.occasion_id
        WHERE h.country = ?
        AND h.date >= ?
        AND h.date < ?
        ORDER BY h.date;`
  ).bind(countryCode, start, end);

  const { results } = await sqlQuery.all<Holiday>();

  return {
    holidays: results,
    country: countryCode,
    year,
  };
}

export async function fetchHolidaysByOcasionId(
  env: CloudflareEnv,
  occasion_id: number) {
  if (env.NEXTJS_ENV === 'development') {
    return sampleHolidays
  }

  const session = env.DB.withSession();

  const sqlQuery = session.prepare(`
  SELECT
    h.holiday_id,
    o.name,
    h.date,
    h.type,
    h.year
  FROM Holidays h
  INNER JOIN Occasions o
    ON h.occasion_id = o.occasion_id
  WHERE h.occasion_id = ?
    AND h.year BETWEEN
        CAST(strftime('%Y', 'now') AS INTEGER) - 5
        AND
        CAST(strftime('%Y', 'now') AS INTEGER) + 5;
  `).bind(occasion_id);

  const { results } = await sqlQuery.all<Holiday>();

  return results;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export const currentYear = new Date().getFullYear();
