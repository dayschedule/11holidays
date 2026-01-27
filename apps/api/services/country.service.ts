import { Country } from '../schema/countrySchema';
import { Bindings } from '../types/binding';

export const getCountries = async (env: Bindings): Promise<Array<Country>> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT * 
      FROM Countries`
  ).bind();
  const { results } = await sqlQuery.all();
  return results as unknown as Array<Country>;
};

export const getCountryById = async (
  env: Bindings,
  country: string
): Promise<Country> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT * 
      FROM Countries
      WHERE country = ?`
  ).bind(country.toUpperCase());

  return await sqlQuery.first<Country>();
};
