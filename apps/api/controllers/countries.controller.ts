import { getCountries, getCountryById } from '../services/country.service';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import { countrySchema } from '../schema/countrySchema';
import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types/binding';

const countries = new OpenAPIHono<{ Bindings: Bindings }>({
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
    description: 'Get all countries',
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': { schema: z.array(countrySchema) },
        },
      },
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
    path: '/:id',
    description: 'Get country by Id',
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': { schema: countrySchema },
        },
      },
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
