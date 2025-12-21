import { z } from '@hono/zod-openapi';

export const occasionSchema = z.object({
  occasion_id: z.number(),
  url: z.string(),
  ref_url: z.string(), // Internal
  name: z.string(),
  image: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export type Occasion = z.infer<typeof occasionSchema>;
