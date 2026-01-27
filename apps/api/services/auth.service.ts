import { nanoid } from "nanoid";
import { Bindings } from "../types/binding";
import { User } from "../schema/authSchema";
import Stripe from "stripe";

export const signupWithEmail = async (
    env: Bindings,
    email: string,
) => {

    const name = email.split('@')[0];
    await env.DB.prepare(
        `
      INSERT OR IGNORE INTO Users (email, name)
      VALUES (?, ?)
    `
    ).bind(email.toLowerCase(), name ?? null)
        .run()
}

export const activateUserAfterOtp = async (
    env: Bindings,
    email: string
) => {
    const sqlQuery = env.DB.prepare(
        `
      UPDATE Users
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `
    ).bind(email.toLowerCase());

    const { meta } = await sqlQuery.run();
    return meta.changes ? true : false;
};

export const generateApiKey = async (
    env: Bindings,
    email: string,
) => {
    const apiKey = `11h_${nanoid(32)}`;
    const sqlQuery = env.DB.prepare(
        `
      UPDATE Users
      SET api_key = ?, updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `
    ).bind(apiKey, email.toLowerCase());

    const { meta } = await sqlQuery.run();
    return meta.changes ? apiKey : null;
};

export const getUserByEmail = async (env: Bindings, email: string) => {
    const sqlQuery = env.DB.prepare(
        `
      SELECT *
      FROM Users
      WHERE email = ?
    `
    ).bind(email.toLowerCase());

    return await sqlQuery.first<User>();
}

export const getUserByApiKey = async (env: Bindings, apiKey: string) => {
    const sqlQuery = env.DB.prepare(
        `
      SELECT *
      FROM Users
      WHERE api_key = ? and status = 'active'
    `
    ).bind(apiKey);

    return await sqlQuery.first<User>();
}
