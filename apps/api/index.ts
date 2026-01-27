import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings } from './types/binding';
import { countries } from './controllers/countries.controller';
import { holidays } from './controllers/holidays.controller';
import { occasions } from './controllers/occasions.controller';
import { auth } from './controllers/auth.controller';
import { cors } from 'hono/cors';

const app = new OpenAPIHono<{ Bindings: Bindings }>().basePath('/v1');

// API Routes
const corsAllowed = ["11holidays.com", "localhost"];
app.use(
    "/*",
    cors({
        origin: (origin, ctx) => {
            const allowedPaths = ["/public", "/api-specs.json"];
            if (!origin || corsAllowed.some((d) => origin.includes(d))) {
                return origin;
            }
            if (allowedPaths.some((path) => ctx.req.url.includes(path))) {
                return origin;
            }
            return "https://11holidays.com";
        },
        maxAge: 86400 * 7,
        credentials: true,
    }),
);

// Public
app.route(`/auth`, auth);


app.route(`/countries`, countries);
app.route(`/holidays`, holidays);
app.route(`/occasions`, occasions);

export default app;
