import { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { Bindings } from "../types/binding";
import { getUserByApiKey } from "../services/auth.service";

export const jwtAuth = (): MiddlewareHandler => {
    return async (ctx: Context<{ Bindings: Bindings }>, next) => {
        const authHeader = ctx.req.header("Authorization");
        if (!authHeader) {
            throw new HTTPException(401, { message: "Missing Authorization header" });
        }

        const [type, apiKey] = authHeader.split(' ') ?? [];
        if (type !== 'Bearer' || !apiKey) {
            throw new HTTPException(401, { message: "Add an api key in header: {Authorization: `Bearer: API_KEY`}" });
        }

        const authUser = await getUserByApiKey(ctx.env, apiKey);

        // ONLY admin can add, update, delete holidays
        if (ctx.req.method !== 'GET' && authUser.role !== 'admin') {
            throw new HTTPException(403, { message: 'Permission denied' })
        }

        ctx.req["user"] = authUser;

        await next();
    };
};