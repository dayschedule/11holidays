import { Country } from '../schema/countrySchema';

export const getCountries = async (env: CloudflareBindings): Promise<Array<Country>> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT * 
      FROM Countries`
  ).bind();
  const { results } = await sqlQuery.all();
  return results as unknown as Array<Country>;
};

export const getCountryById = async (
  env: CloudflareBindings,
  country: string
): Promise<Country | null> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT * 
      FROM Countries
      WHERE country = ?`
  ).bind(country.toUpperCase());

  return await sqlQuery.first<Country>();
};
