import { addYears, format, parseISO, startOfYear } from 'date-fns';

export interface Holiday {
  holiday_id: number;
  date: string;
  name: string;
  type: string;
  url?: string | null;
  year?: number;
  description?: string;
  country?: string;
  countryCode?: string;
}

export interface HolidaysResponse {
  holidays: Holiday[];
  country: string;
  year: number;
}

export interface HolidaySearchResult {
  holiday_id: number;
  name: string;
  date: string;
  country: string;
  type: string;
  url: string | null;
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
        CAST(strftime('%Y', 'now') AS INTEGER) + 5
  ORDER BY h.date;
  `).bind(occasion_id);

  const { results } = await sqlQuery.all<Holiday>();

  return results;
}

/** Holidays observed on a given date in every country. */
export async function fetchHolidaysOnDate(
  env: CloudflareEnv,
  date: string,
  limit = 60
) {
  const session = env.DB.withSession();
  const { results } = await session
    .prepare(
      `
      SELECT h.holiday_id, o.name, h.date, h.country, h.type,
        CASE WHEN o.description IS NOT NULL THEN o.url ELSE NULL END AS url
      FROM Holidays AS h
      LEFT JOIN Occasions AS o ON h.occasion_id = o.occasion_id
      WHERE h.date = ?
      ORDER BY h.country
      LIMIT ?`
    )
    .bind(date, limit)
    .all<HolidaySearchResult>();

  return results;
}

/** Search holidays by name for the current year, optionally within one country. */
export async function searchHolidays(
  env: CloudflareEnv,
  query: string,
  countryCode?: string,
  limit = 30
) {
  const year = new Date().getFullYear();
  const session = env.DB.withSession();
  const like = `%${query.replace(/[%_]/g, '')}%`;

  const { results } = await session
    .prepare(
      `
      SELECT h.holiday_id, o.name, h.date, h.country, h.type,
        CASE WHEN o.description IS NOT NULL THEN o.url ELSE NULL END AS url
      FROM Holidays AS h
      INNER JOIN Occasions AS o ON h.occasion_id = o.occasion_id
      WHERE h.year = ?
        AND o.name LIKE ?
        AND (? IS NULL OR h.country = ?)
      ORDER BY (o.description IS NULL), h.date
      LIMIT ?`
    )
    .bind(year, like, countryCode ?? null, countryCode ?? null, limit)
    .all<HolidaySearchResult>();

  return results;
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

export function getDayOfWeek(dateString: string): string {
  return format(parseISO(dateString), 'EEEE');
}

export function downloadBlob(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string) {
  downloadBlob(JSON.stringify(data, null, 2), 'application/json', filename);
}

export function toCSV(holidays: Pick<Holiday, 'date' | 'name' | 'type'>[]) {
  const headers = ['Date', 'Name', 'Type', 'Day of Week'];
  const rows = holidays.map((holiday) => [
    holiday.date,
    holiday.name,
    holiday.type,
    getDayOfWeek(holiday.date),
  ]);

  return [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/** "in/diwali" -> { country: "in", slug: "diwali" } for typed router links */
export function occasionParams(url: string) {
  const [country = '', ...rest] = url.split('/');
  return { country, slug: rest.join('/') };
}

const PUBLIC_TYPES = ['public', 'gazetted', 'national', 'federal', 'bank'];
const LOCAL_TYPES = ['local', 'regional', 'state', 'provincial', 'restricted'];

export type HolidayKind = 'public' | 'local' | 'other';

export function holidayKind(type: string): HolidayKind {
  const t = type.toLowerCase();
  if (PUBLIC_TYPES.some((x) => t.includes(x))) return 'public';
  if (LOCAL_TYPES.some((x) => t.includes(x))) return 'local';
  return 'other';
}

export const currentYear = new Date().getFullYear();
