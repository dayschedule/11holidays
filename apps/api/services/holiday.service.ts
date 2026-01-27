import { Bindings } from '../types/binding';
import { Holiday } from '../schema/holidaySchema';
import { Occasion } from '../schema/occasoinSchema';
import { escapeSQL, slugify } from '../helper/utility';
import { addYears, format, startOfYear } from 'date-fns';

export const getHolidaysByCountry = async (
  env: Bindings,
  country: string,
  year: number
): Promise<Array<Holiday>> => {
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
  ).bind(country.toUpperCase(), start, end);
  const { results } = await sqlQuery.all();
  return results as unknown as Array<Holiday>;
};

export const getHolidayById = async (
  env: Bindings,
  holidayId: number
): Promise<Holiday> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT * 
        FROM Holidays
        WHERE holiday_id = ?`
  ).bind(holidayId);

  return await sqlQuery.first();
};

export const createHoliday = async (
  env: Bindings,
  data: Holiday
): Promise<number> => {
  const { meta } = await env.DB.prepare(
    `
        INSERT INTO Holidays (date, occasion_id, type, country) 
        VALUES (?, ?, ?, ?)`
  )
    .bind(data.date, data.occasion_id, data.type, data.country)
    .run();

  return meta.lastInsertRowid;
};

export const updateHoliday = async (
  env: Bindings,
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
  env: Bindings,
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

export const importHolidays = async (
  env: Bindings,
  holidays: Array<Holiday>
) => {
  if (!holidays.length) return;

  for (const holiday of holidays) {
    holiday.url =
      slugify(holiday.country) + '/' + slugify(holiday.url || holiday.name);
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

const bulkInsertHolidays = async (env: Bindings, holidays: Array<Holiday>) => {
  const multiQuery = `
      WITH TempHolidays(date, occasion_id, type, country) AS (
          VALUES ${holidays
      .map(
        (h) =>
          `('${h.date}', ${h.occasion_id}, '${escapeSQL(
            h.type
          )}', '${escapeSQL(h.country)}')`
      )
      .join(', ')}
      )
      INSERT INTO Holidays (date, occasion_id, type, country)
          SELECT DISTINCT t.date, t.occasion_id, t.type, t.country
          FROM TempHolidays t
          LEFT JOIN Holidays o 
          ON t.date = o.date and t.country = o.country
          WHERE o.date IS NULL;
  `;

  await env.DB.prepare(multiQuery).run();
};

const bulkInsertOccassions = async (
  env: Bindings,
  holidays: Array<Holiday>
) => {
  const multiQuery = `
      WITH TempOccasions(name, url, ref_url, description) AS (
          VALUES ${holidays
      .map(
        (h) =>
          `('${escapeSQL(h.name)}', '${h.url}', '${h.ref_url
          }', '${escapeSQL(h.description!)}')`
      )
      .join(', ')}
      )
      INSERT INTO Occasions (name, url, ref_url, description)
          SELECT DISTINCT t.name, t.url, t.ref_url, t.description
          FROM TempOccasions t
          LEFT JOIN Occasions o ON t.url = o.url
          WHERE o.url IS NULL;
  `;

  await env.DB.prepare(multiQuery).run();

  // Return ids
  const { results } = await env.DB.prepare(
    `
      SELECT occasion_id, url FROM Occasions WHERE url IN (${holidays
      .map((holiday) => `'${holiday.url}'`)
      .join(', ')})
  `
  ).run();
  return results as unknown as Array<Occasion>;
};
