import { OpenAPIHono } from '@hono/zod-openapi';
import { countries } from './controllers/countries.controller';
import { holidays } from './controllers/holidays.controller';
import { occasions } from './controllers/occasions.controller';
import { auth } from './controllers/auth.controller';
import { cors } from 'hono/cors';
import { jwtAuth } from './middleware/auth';
import { HTTPException } from 'hono/http-exception';
import { apiDescription } from './helper/openapi';

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>().basePath('/v1');

app.onError(async (err, ctx) => {
    if (err instanceof HTTPException) {
        return ctx.json({ message: err.message }, err.status);
    } else {
        console.error(`Server error`, err);
        return ctx.json({ message: 'Server error' }, 500);
    }
});

// API Routes
const corsAllowed = ["11holidays.com", "localhost"];
app.use(
    "/*",
    cors({
        origin: (origin, ctx) => {
            const allowedPaths = ["/public", "/openapi.json"];
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

// API specification
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    description: "API key from https://11holidays.com/api-key",
});

app.get("/openapi.json", async (ctx) => {
    const apiSpecs = app.getOpenAPIDocument({
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "11holidays API",
            description: apiDescription,
        },
        security: [{ Bearer: [] }],
        tags: [
            {
                name: "Holidays",
                description: "Public holidays, bank holidays and observances by country and year",
            },
            {
                name: "Countries",
                description: "Countries with holiday data",
            },
        ],
        servers: [
            {
                url: "https://api.11holidays.com",
                description: "API",
            },
        ],
    });
    ctx.header("Cache-Control", "public, max-age=3600");
    return ctx.json(apiSpecs);
});

app.use(jwtAuth());

app.route(`/countries`, countries);
app.route(`/holidays`, holidays);
app.route(`/occasions`, occasions);

app.notFound(async (ctx) => {
    return ctx.json(
        { error: "No routes found" },
        404,
    );
});

export default app;
