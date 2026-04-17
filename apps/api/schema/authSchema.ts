import { z } from '@hono/zod-openapi';

export const authUserSchema = z.object({
    email: z.email(),
    plan: z.enum(['Free', 'Pro', 'Lifetime']).optional().nullable(),
    role: z.string().optional().nullable()
});

export type AuthUser = z.infer<typeof authUserSchema>;
