import { Holiday } from '../schema/holidaySchema';
import { Occasion } from '../schema/occasoinSchema';
import { escapeSQL, slugify } from '../helper/utility';
import { addYears, format, startOfYear } from 'date-fns';

export const getHolidaysByCountry = async (
  env: CloudflareBindings,
  country: string,
  year: number
): Promise<Array<Holiday>> => {
  const baseDate = new Date(year, 0, 1);
  const start = format(startOfYear(baseDate), 'yyyy-MM-dd');
  const end = format(addYears(startOfYear(baseDate), 1), 'yyyy-MM-dd');

  const session = env.DB.withSession();
  const sqlQuery = session.prepare(
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
  ).bind(country.toUpperCase(), start, end);
  const { results } = await sqlQuery.all();
  return results as unknown as Array<Holiday>;
};

export const getHolidayById = async (
  env: CloudflareBindings,
  holidayId: number
): Promise<Holiday | null> => {
  const session = env.DB.withSession();
  const sqlQuery = session.prepare(
    `
        SELECT * 
        FROM Holidays
        WHERE holiday_id = ?`
  ).bind(holidayId);

  return await sqlQuery.first();
};

export const createHoliday = async (
  env: CloudflareBindings,
  data: Holiday
): Promise<number> => {
  const { meta } = await env.DB.prepare(
    `
        INSERT INTO Holidays (date, occasion_id, type, country) 
        VALUES (?, ?, ?, ?)`
  )
    .bind(data.date, data.occasion_id, data.type, data.country)
    .run();

  return meta.lastInsertRowid as number;
};

export const updateHoliday = async (
  env: CloudflareBindings,
  holidayId: number,
  data: Holiday
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
    `
        UPDATE Holidays 
        SET date = ?, occasion_id = ?, type = ?, country_id = ? 
        WHERE holiday_id = ?`
  )
    .bind(data.date, data.occasion_id, data.type, data.country, holidayId)
    .run();

  return success;
};

export const deleteHoliday = async (
  env: CloudflareBindings,
  holidayId: number
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
    `
        DELETE FROM Holidays 
        WHERE holiday_id = ?`
  )
    .bind(holidayId)
    .run();

  return success;
};

function cleanName(name: string): string {
    return name
        .replace(/\s*\(Tentative Date\)$/i, '')
        .replace(/\s*\(Observed\)$/i, '')
        .replace(/\s+observed$/i, '')
        .trim();
}

export const importHolidays = async (
  env: CloudflareBindings,
  holidays: Array<Holiday>
) => {
  if (!holidays.length) return;

  for (const holiday of holidays) {
    const slug = holiday.ref_url?.split('/').pop()?.replace('.html', '');
    holiday.url = slugify(holiday.country) + '/' + slug;
    holiday.name = cleanName(holiday.name);
  }

  // Set occasion_id
  const occasions = await bulkInsertOccassions(env, holidays);
  for (const holiday of holidays) {
    holiday.occasion_id = occasions.find(
      (x) => x.url === holiday.url
    )?.occasion_id;
  }
  // Bulk insert holidays
  await bulkInsertHolidays(env, holidays);
};

const bulkInsertHolidays = async (
  env: CloudflareBindings,
  holidays: Array<Holiday>
) => {
  const multiQuery = `
    INSERT INTO Holidays (
      date,
      year,
      occasion_id,
      type,
      country
    )
    VALUES
      ${holidays
      .map(
        (h) => `(
            '${h.date}',
            ${new Date(h.date).getUTCFullYear()},
            ${h.occasion_id},
            '${escapeSQL(h.type)}',
            '${escapeSQL(h.country)}'
          )`
      )
      .join(", ")}

    ON CONFLICT(occasion_id, country, year)
    DO UPDATE SET
      date = excluded.date,
      type = excluded.type;
  `;

  await env.DB.prepare(multiQuery).run();
};

const bulkInsertOccassions = async (
  env: CloudflareBindings,
  holidays: Array<Holiday>
) => {
  const multiQuery = `
    INSERT INTO Occasions (name, url, ref_url)
    VALUES
      ${holidays
      .map(
        (h) => `(
            '${escapeSQL(h.name)}',
            '${h.url}',
            '${h.ref_url}'
          )`
      )
      .join(", ")}

    ON CONFLICT(url)
    DO UPDATE SET
      name = excluded.name,
      ref_url = excluded.ref_url;
  `;

  await env.DB.prepare(multiQuery).run();

  // Return ids
  const { results } = await env.DB.prepare(`
    SELECT occasion_id, url
    FROM Occasions
    WHERE url IN (
      ${holidays.map((h) => `'${h.url}'`).join(", ")}
    )
  `).run();

  return results as unknown as Array<Occasion>;
};
