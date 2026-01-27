import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types/binding';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { activateUserAfterOtp, generateApiKey, getUserByEmail, signupWithEmail } from '../services/auth.service';
import { sendMandrillEmail } from '../services/emailer.service';
import { z } from '@hono/zod-openapi';
import { createStripeSession } from '../services/stripe.service';

const auth = new Hono<{ Bindings: Bindings }>();

auth.post('/',
    validator("json", (value, ctx) => {
        const parsed = z.object({
            email: z.email(),
        }).safeParse(value);

        if (parsed.success === false) {
            throw new HTTPException(400, { message: formatZodError(parsed.error) });
        }
        return parsed.data;
    }),
    async (ctx) => {
        const user = ctx.req.valid("json");
        // 1. Ensure user exists
        await signupWithEmail(ctx.env, user.email);

        // 2. Send OTP email
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Store OTP in KV (10 min expiry)
        await ctx.env.KVCACHE.put(`otp:${user.email.toLowerCase()}`, otp, {
            expirationTtl: 60 * 10,
        });

        // 4. Send email
        await sendMandrillEmail(ctx.env, {
            to: user.email,
            subject: "Your 11holidays API verification code",
            html: `
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:4px;">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
        });

        return ctx.json({ message: 'OTP email sent successfully' }, 201);
    });

auth.post('/verify',
    validator("json", (value, ctx) => {
        const parsed = z.object({
            email: z.email(),
            otp: z.coerce
                .number()
                .int()
                .min(100000)
                .max(999999)
        }).safeParse(value);

        if (parsed.success === false) {
            throw new HTTPException(400, { message: formatZodError(parsed.error) });
        }
        return parsed.data;
    }),
    async (ctx) => {
        const { email, otp } = ctx.req.valid("json");
        const storedOtp = await ctx.env.KVCACHE.get<string>(`otp:${email.toLowerCase()}`);
        if (storedOtp !== otp.toString()) {
            throw new HTTPException(400, { message: 'Invalid or expired OTP code' });
        }
        await activateUserAfterOtp(ctx.env, email);
        const user = await getUserByEmail(ctx.env, email);
        return ctx.json(user, 200);
    });

auth.post('/checkout',
    validator("json", (value, ctx) => {
        const parsed = z.object({
            email: z.email(),
            plan: z.enum(['Pro', 'Lifetime']),
        }).safeParse(value);

        if (parsed.success === false) {
            throw new HTTPException(400, { message: formatZodError(parsed.error) });
        }
        return parsed.data;
    }),
    async (ctx) => {
        const { email, plan } = ctx.req.valid("json");
        const user = await getUserByEmail(ctx.env, email);
        if (!user) {
            throw new HTTPException(404, { message: 'No account found' })
        }

        const session = await createStripeSession(ctx.env, email, plan);

        return ctx.json({ url: session.url }, 200);
    });

auth.post('/apikey',
    validator("json", (value, ctx) => {
        const parsed = z.object({
            email: z.email(),
        }).safeParse(value);

        if (parsed.success === false) {
            throw new HTTPException(400, { message: formatZodError(parsed.error) });
        }
        return parsed.data;
    }),
    async (ctx) => {
        const { email } = ctx.req.valid("json");
        const user = await getUserByEmail(ctx.env, email);
        if (!user) {
            throw new HTTPException(404, { message: 'No account found' })
        }

        if (user.plan !== 'Pro' && user.plan !== 'Lifetime') {
            throw new HTTPException(404, { message: 'Please upgrade your plan' })
        }

        const apiKey = await generateApiKey(ctx.env, user.email);

        return ctx.json({ ...user, api_key: apiKey }, 200);
    });


export { auth };
