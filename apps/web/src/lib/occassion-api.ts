import { format } from "date-fns";

export type OccasionImage = {
  url: string;
  thumb?: string;
  alt?: string;
  photographer?: string;
  photographer_url?: string;
  unsplash_url?: string;
  query?: string;
};

export interface Occasion {
  occasion_id: number;
  url: string;
  name: string;
  description?: string;
  date: string;
  country?: string;
  image?: OccasionImage | null;
  updated_at?: string;
}

export async function fetchOccasion(
  env: CloudflareEnv,
  url: string,
) {
  const session = env.DB.withSession();

  const sqlQuery = session.prepare(`
    SELECT
      occasion_id,
      url,
      name,
      description,
      image,
      updated_at
    FROM Occasions
    WHERE url = ?
    LIMIT 1
  `).bind(url);

  const occasion = await sqlQuery.first<Occasion>();
  if (occasion && occasion.image) {
    occasion.image = JSON.parse(occasion.image as unknown as string) as OccasionImage;
  }

  return occasion;
}

export async function fetchOccasions(
  env: CloudflareEnv,
  offset: number = 0,
  limit: number = 5000
) {
  try {
    const session = env.DB.withSession();

    const sqlQuery = session.prepare(`
    SELECT
      o.occasion_id,
      o.url,
      o.name,
      o.image,
      h.date,
      h.country,
      o.updated_at
    FROM Occasions as o
    LEFT JOIN Holidays as h
    on o.occasion_id = h.occasion_id
    where 
      h.year = CAST(strftime('%Y', 'now') AS INTEGER) 
      and o.description IS NOT NULL
    ORDER BY o.updated_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset);

    const { results } = await sqlQuery.all<Occasion>();
    return results.map(x => ({
      ...x,
      image: x.image ? JSON.parse(x.image as unknown as string) as OccasionImage : null
    }));

  } catch (error) {
    console.error("Error fetching occasions:", error);
    return [];
  }
}

export async function fetchOccasionByCountry(
  env: CloudflareEnv,
  countryCode: string,
) {
  try {
    const session = env.DB.withSession();

    const sqlQuery = session
      .prepare(`
        SELECT
          o.occasion_id,
          o.url,
          o.name,
          o.image,
          h.date,
          h.country,
          o.updated_at
        FROM Occasions AS o
        LEFT JOIN Holidays AS h
          ON o.occasion_id = h.occasion_id
        WHERE
          h.year = CAST(strftime('%Y', 'now') AS INTEGER)
          AND o.description IS NOT NULL
          AND h.country = ?
        ORDER BY o.updated_at DESC
      `)
      .bind(countryCode);

    const { results } = await sqlQuery.all<Occasion>();

    return results.map((x) => ({
      ...x,
      image: x.image
        ? (JSON.parse(x.image as unknown as string) as OccasionImage)
        : null,
    }));
  } catch (error) {
    console.error('Error fetching occasions:', error);
    return [];
  }
}

export async function fetchUpcomingOccasions(
  env: CloudflareEnv,
  countryCode: string,
  limit = 8
) {
  // Search this year and next, so late in the year the list continues into January instead of
  // falling back to dates that have already passed
  const now = new Date();
  const year = now.getFullYear();

  try {
    const { results } = await env.DB.withSession()
      .prepare(`
        SELECT
          o.occasion_id,
          o.url,
          o.name,
          o.image,
          h.date,
          h.country,
          o.updated_at
        FROM Occasions AS o
        JOIN Holidays AS h
          ON o.occasion_id = h.occasion_id
        WHERE
          h.country = ?
          AND h.year IN (?, ?)
          AND h.date >= ?
          AND o.description IS NOT NULL
        ORDER BY h.date
        LIMIT ?
      `)
      // Extra rows so an occasion listed in both years can be dropped below
      .bind(countryCode, year, year + 1, format(now, 'yyyy-MM-dd'), limit * 2)
      .all<Occasion>();

    const seen = new Set<number>();
    return results
      .filter((x) => !seen.has(x.occasion_id) && seen.add(x.occasion_id))
      .slice(0, limit)
      .map((x) => ({
        ...x,
        image: x.image ? (JSON.parse(x.image as unknown as string) as OccasionImage) : null,
      }));
  } catch (error) {
    console.error('Error fetching upcoming occasions:', error);
    return [];
  }
}

