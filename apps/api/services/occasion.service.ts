import { Occasion } from '../schema/occasoinSchema';

export const getOccasions = async (
  env: CloudflareBindings,
  offset: number = 0,
  limit: number = 20
) => {
  const session = env.DB.withSession();
  const sqlQuery = session.prepare(
    `
      SELECT * 
      FROM Occasions
      LIMIT ?, ?`
  ).bind(offset, limit);

  const { results } = await sqlQuery.all();
  return results;
};

export const getOccasionById = async (
  env: CloudflareBindings,
  occasionId: number
): Promise<Occasion | null> => {
  const session = env.DB.withSession();
  const sqlQuery = session.prepare(
    `
      SELECT * 
      FROM Occasions
      WHERE occasion_id = ?`
  ).bind(occasionId);

  return await sqlQuery.first<Occasion>();
};

export const createOccasion = async (
  env: CloudflareBindings,
  data: Occasion
): Promise<number> => {
  const response = await env.DB.prepare(
    `
      INSERT INTO Occasions (url, name, image, description) 
      VALUES (?, ?, ?, ?)`
  )
    .bind(data.url, data.name, data.image, data.description)
    .run();

  return response.meta.last_row_id;
};

export const updateOccasion = async (
  env: CloudflareBindings,
  occasionId: number,
  data: Occasion
): Promise<boolean> => {
  const response = await env.DB.prepare(
    `
      UPDATE Occasions 
      SET url = ?, name = ?, image = ?, description = ? 
      WHERE occasion_id = ?`
  )
    .bind(data.url, data.name, data.image, data.description, occasionId)
    .run();

  return response.meta.changes > 0;
};

export const deleteOccasion = async (
  env: CloudflareBindings,
  occasionId: number
): Promise<boolean> => {
  const response = await env.DB.prepare(
    `
      DELETE FROM Occasions 
      WHERE occasion_id = ?`
  )
    .bind(occasionId)
    .run();

  return response.meta.changes > 0;
};
