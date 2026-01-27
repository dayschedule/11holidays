import {
  getHolidaysByCountry,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  importHolidays,
} from '../services/holiday.service';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { formatZodError } from '../helper/utility';
import { Holiday, holidaySchema } from '../schema/holidaySchema';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types/binding';

const holidays = new OpenAPIHono<{ Bindings: Bindings }>({
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

holidays.openapi(
  createRoute({
    tags: ['Holidays'],
    method: 'get',
    path: '/',
    description: 'Get all holidays',
    request: {
      //params: pagedSchema,
    },
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': { schema: z.array(holidaySchema) },
        },
      },
    },
  }),
  async (ctx) => {
    const country = ctx.req.query('country');
    const year = Number(ctx.req.query('year')) || new Date().getFullYear();

    if (!country || country.length != 2) {
      throw new HTTPException(400, {
        message: `Invalid country: ${country}. Must be a valid ISO2 country code`,
      });
    }
    const results = await getHolidaysByCountry(ctx.env, country, year);
    return ctx.json(results, 200);
  }
);

holidays.openapi(
  createRoute({
    tags: ['Holidays'],
    method: 'get',
    path: '/:id',
    description: 'Get holiday by id',
    request: {
      //params: pagedSchema,
    },
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': { schema: holidaySchema },
        },
      },
    },
  }),
  async (ctx) => {
    const id = Number(ctx.req.param('id'));
    const data = await getHolidayById(ctx.env, id);
    if (!data) {
      throw new HTTPException(404, {
        message: `No holidays found`,
      });
    }
    return ctx.json(data, 200);
  }
);

holidays.post('/', async (ctx) => {
  const holidays: Holiday = await ctx.req.json();
  if (Array.isArray(holidays)) {
    await importHolidays(ctx.env, holidays);
  } else {
    holidays.holiday_id = await createHoliday(ctx.env, holidays);
  }
  return ctx.json(holidays, 201);
});

holidays.put('/:id', async (ctx) => {
  const id = ctx.req.param('id');
  const holidayData: Holiday = await ctx.req.json();
  const success = await updateHoliday(ctx.env, Number(id), holidayData);
  if (success) {
    return ctx.json({ message: 'Holiday updated successfully' }, 200);
  } else {
    throw new HTTPException(404, {
      message: `No holiday found with id: ${id}`,
    });
  }
});

holidays.delete('/:id', async (ctx) => {
  const id = ctx.req.param('id');
  const success = await deleteHoliday(ctx.env, Number(id));
  if (success) {
    return ctx.json({ message: 'Holiday deleted successfully' }, 200);
  } else {
    throw new HTTPException(404, {
      message: `No holiday found with id: ${id}`,
    });
  }
});

export { holidays };
