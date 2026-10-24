import { getCountries, getCountryById } from '../services/country.service';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import { countrySchema } from '../schema/countrySchema';
import { formatZodError } from '../helper/utility';
import { errorResponses } from '../helper/openapi';
import { HTTPException } from 'hono/http-exception';

const countries = new OpenAPIHono<{ Bindings: CloudflareBindings }>({
  defaultHook: (result, c) => {
    if (result.success === false) {
      return c.json(
        {
          message: formatZodError(result.error),
        },
        400
      );
    }
  },
});

countries.openapi(
  createRoute({
    tags: ['Countries'],
    method: 'get',
    path: '/',
    summary: 'List countries',
    description: 'Get all countries with holiday data, with ISO2 country code and name',
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': { schema: z.array(countrySchema) },
        },
      },
      ...errorResponses(401),
    },
  }),
  async (ctx) => {
    const results = await getCountries(ctx.env);
    return ctx.json(results);
  }
);

countries.openapi(
  createRoute({
    tags: ['Countries'],
    method: 'get',
    path: '/{id}',
    summary: 'Get a country',
    description: 'Get country by ISO2 country code',
    request: {
      params: z.object({
        id: z.string().length(2).openapi({
          param: { name: 'id', in: 'path' },
          example: 'US',
          description: 'Country code in ISO2 format',
        }),
      }),
    },
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': { schema: countrySchema },
        },
      },
      ...errorResponses(400, 401, 404),
    },
  }),
  async (ctx) => {
    const id = ctx.req.param('id');
    const data = await getCountryById(ctx.env, id);
    if (!data) {
      throw new HTTPException(404, { message: 'No country found' });
    }
    return ctx.json(data, 200);
  }
);

export { countries };
