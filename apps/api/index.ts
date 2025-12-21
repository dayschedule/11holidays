import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings } from './binding';
import { countries } from './controllers/countries.controller';
import { holidays } from './controllers/holidays.controller';
import { occasions } from './controllers/occasions.controller';

const app = new OpenAPIHono<{ Bindings: Bindings }>().basePath('/v1');

app.route(`/countries`, countries);
app.route(`/holidays`, holidays);
app.route(`/occasions`, occasions);

export default app;
