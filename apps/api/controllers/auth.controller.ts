import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { claimApiKey, sendApiKeyEmail } from '../services/auth.service';
import { z } from '@hono/zod-openapi';
import { createStripeSession, getPaidCheckout } from '../services/stripe.service';

const auth = new Hono<{ Bindings: CloudflareBindings }>();

auth.post('/checkout',
    validator("json", (value, ctx) => {
        const parsed = z.object({
            plan: z.enum(['Pro', 'Lifetime']),
        }).safeParse(value);

        if (parsed.success === false) {
            throw new HTTPException(400, { message: formatZodError(parsed.error) });
        }
        return parsed.data;
    }),
    async (ctx) => {
        const { plan } = ctx.req.valid("json");
        const session = await createStripeSession(ctx.env, plan);

        return ctx.json({ url: session.url }, 200);
    });

auth.post('/apikey',
    validator("json", (value, ctx) => {
        const parsed = z.object({
            session_id: z.string().startsWith('cs_'),
        }).safeParse(value);

        if (parsed.success === false) {
            throw new HTTPException(400, { message: formatZodError(parsed.error) });
        }
        return parsed.data;
    }),
    async (ctx) => {
        const { session_id } = ctx.req.valid("json");
        const { email, plan } = await getPaidCheckout(ctx.env, session_id);

        const claim = await claimApiKey(ctx.env, email, plan, session_id);
        if (!claim) {
            throw new HTTPException(409, {
                message: 'An API key already exists for this email. Please contact support@11holidays.com',
            });
        }

        if (claim.isNew) {
            ctx.executionCtx.waitUntil(sendApiKeyEmail(ctx.env, claim.user));
        }

        return ctx.json(claim.user, 200);
    });


export { auth };
