import { nanoid } from "nanoid";
import { AuthUser } from "../schema/authSchema";
import { PaidPlan } from "./stripe.service";

type ApiKeyUser = Pick<AuthUser, 'email' | 'plan'> & { api_key: string };

/**
 * Creates the paying user and their API key, once per Stripe checkout session.
 *
 * Stripe doesn't verify the checkout email, so a key that already exists is only
 * returned to the session that created it. Otherwise paying with someone else's
 * email would reveal their key. Returns null in that case.
 */
export const claimApiKey = async (
    env: CloudflareBindings,
    email: string,
    plan: PaidPlan,
    sessionId: string,
) => {
    const normalizedEmail = email.toLowerCase();
    const name = normalizedEmail.split('@')[0];
    const apiKey = `11h_${nanoid(32)}`;

    const claimed = await env.DB.prepare(
        `
      INSERT INTO Users (email, name, plan, status, api_key, stripe_session_id)
      VALUES (?, ?, ?, 'active', ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        plan = excluded.plan,
        status = 'active',
        api_key = excluded.api_key,
        stripe_session_id = excluded.stripe_session_id,
        updated_at = CURRENT_TIMESTAMP
      WHERE Users.api_key IS NULL
      RETURNING email, plan, api_key
    `
    ).bind(normalizedEmail, name, plan, apiKey, sessionId)
        .first<ApiKeyUser>();

    if (claimed) {
        return { user: claimed, isNew: true };
    }

    // Already claimed: a page refresh of the same session gets the same key
    const existing = await env.DB.prepare(
        `
      SELECT email, plan, api_key
      FROM Users
      WHERE email = ? AND stripe_session_id = ?
    `
    ).bind(normalizedEmail, sessionId)
        .first<ApiKeyUser>();

    return existing ? { user: existing, isNew: false } : null;
};

// The key is already on screen, so a failed email is logged rather than thrown
export const sendApiKeyEmail = async (env: CloudflareBindings, user: ApiKeyUser) => {
    try {
        await env.EMAIL.send({
            from: "11holidays <support@11holidays.com>",
            to: user.email,
            subject: `Your 11holidays API key`,
            html: `
      <h2>Thanks for your purchase</h2>
      <p>Your 11holidays ${user.plan} API key is:</p>
      <p><code style="font-size:16px;">${user.api_key}</code></p>
      <p>Include it in the header of every request:</p>
      <p><code>Authorization: Bearer YOUR_API_KEY</code></p>
      <p>Keep this key secure. See the <a href="https://11holidays.com/docs/api">API docs</a> to get started.</p>
    `,
        });
    } catch (err) {
        console.error(`Failed to send API key email`, err);
    }
};

export const getUserByApiKey = async (env: CloudflareBindings, apiKey: string) => {
    const sqlQuery = env.DB.prepare(
        `
      SELECT *
      FROM Users
      WHERE api_key = ? and status = 'active'
    `
    ).bind(apiKey);

    return await sqlQuery.first<AuthUser>();
}
