import { z } from '@hono/zod-openapi';

export const countrySchema = z
  .object({
    country: z.string().max(2).openapi({
      example: 'US',
      description: 'Country code in ISO2 format',
    }),
    name: z.string().max(100).openapi({
      example: 'United States',
      description: 'Name of the country',
    }),
  })
  .openapi('Countries');

export type Country = z.infer<typeof countrySchema>;
