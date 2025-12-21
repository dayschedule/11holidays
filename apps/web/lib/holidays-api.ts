import { addYears, format, startOfYear } from 'date-fns';

export interface Holiday {
  date: string;
  name: string;
  type: string;
  description?: string;
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
  // Use start - end date to utilize sql index for better query performance
  const baseDate = new Date(year, 0, 1);
  const start = format(startOfYear(baseDate), 'yyyy-MM-dd');
  const end = format(addYears(startOfYear(baseDate), 1), 'yyyy-MM-dd');

  const sqlQuery = env.DB.prepare(
    `
        SELECT h.holiday_id, o.name, h.date, o.description, h.occasion_id, h.country, h.type, 
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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

export function downloadJSON(data: any, filename: string) {
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
