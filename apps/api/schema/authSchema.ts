import { z } from '@hono/zod-openapi';

export const userSchema = z.object({
    email: z.email(),
});

export type User = z.infer<typeof userSchema>;
