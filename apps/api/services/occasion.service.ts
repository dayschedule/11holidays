import { Context } from 'hono';
import { Occasion } from '../schema/occasoinSchema';

export const getOccasions = async (
  ctx: Context,
  offset: number = 0,
  limit: number = 20
): Promise<Array<Occasion>> => {
  const sqlQuery = ctx.env.DB.prepare(
    `
      SELECT * 
      FROM Occasions
      LIMIT ?, ?`
  ).bind(offset, limit);

  const { results } = await sqlQuery.all();
  return results;
};

export const getOccasionById = async (
  ctx: Context,
  occasionId: number
): Promise<Occasion> => {
  const sqlQuery = ctx.env.DB.prepare(
    `
      SELECT * 
      FROM Occasions
      WHERE occasion_id = ?`
  ).bind(occasionId);

  return await sqlQuery.first();
};

export const createOccasion = async (
  ctx: Context,
  data: Occasion
): Promise<number> => {
  const response = await ctx.env.DB.prepare(
    `
      INSERT INTO Occasions (url, name, image, description) 
      VALUES (?, ?, ?, ?)`
  )
    .bind(data.url, data.name, data.image, data.description)
    .run();

  return response.lastInsertRowid;
};

export const updateOccasion = async (
  ctx: Context,
  occasionId: number,
  data: Occasion
): Promise<boolean> => {
  const response = await ctx.env.DB.prepare(
    `
      UPDATE Occasions 
      SET url = ?, name = ?, image = ?, description = ? 
      WHERE occasion_id = ?`
  )
    .bind(data.url, data.name, data.image, data.description, occasionId)
    .run();

  return response.changes > 0;
};

export const deleteOccasion = async (
  ctx: Context,
  occasionId: number
): Promise<boolean> => {
  const response = await ctx.env.DB.prepare(
    `
      DELETE FROM Occasions 
      WHERE occasion_id = ?`
  )
    .bind(occasionId)
    .run();

  return response.changes > 0;
};
