import { z } from '@hono/zod-openapi';

export const holidaySchema = z
  .object({
    holiday_id: z.number().openapi({
      example: 1,
      description: 'Unique holiday id',
    }),
    name: z.string().openapi({
      example: `Christmas eve ${new Date().getFullYear()}`,
      description: 'Name of the Holiday',
    }),
    description: z.string().optional().nullable(),
    date: z.string().openapi({
      example: `${new Date().getFullYear()}-12-25`,
      description: 'Date of holiday in YYYY-MM-DD format',
    }),
    type: z.string().openapi({
      example: 'Public holiday',
      description: 'Type of holidays. e.g public holiday, bank holiday etc',
    }),
    url: z.string().optional().nullable(),
    country: z.string().max(2).openapi({
      example: 'US',
      description: 'Country code in ISO2 format',
    }),
    occasion_id: z
      .number()
      .openapi({
        example: 2,
        description: 'Unique occasion id',
      })
      .optional()
      .nullable(),
    created_at: z.string().openapi({
      description: 'Timestamp when this holiday was created',
    }),
    updated_at: z.string().openapi({
      description: 'Timestamp when this holiday was last updated',
    }),

    // Internal use only
    ref_url: z.string().optional().nullable(),
  })
  .openapi('Holidays');

export type Holiday = z.infer<typeof holidaySchema>;
