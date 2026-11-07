import Stripe from "stripe";
import { HTTPException } from "hono/http-exception";

export type PaidPlan = 'Pro' | 'Lifetime';

const stripeClient = (env: CloudflareBindings) => {
    return new Stripe(env.STRIPE_SECRET_KEY);
};

const PRICE_MAP: Record<PaidPlan, string> = {
    Pro: 'price_1QLNmESFMLczVMp38i9px40b',
    Lifetime: 'price_1Su6HZSFMLczVMp32G7w86rm',
};

const isPaidPlan = (plan?: string): plan is PaidPlan => plan === 'Pro' || plan === 'Lifetime';

// Stripe collects the customer's email on the hosted checkout page
export const createStripeSession = async (
    env: CloudflareBindings,
    plan: PaidPlan
) => {
    const stripe = stripeClient(env);
    return await stripe.checkout.sessions.create({
        mode: plan === 'Pro' ? 'subscription' : 'payment',
        line_items: [
            {
                price: PRICE_MAP[plan],
                quantity: 1,
            },
        ],
        success_url: `https://11holidays.com/api-key?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://11holidays.com/api-key`,
        metadata: {
            plan,
        },
    });
};

export const getPaidCheckout = async (env: CloudflareBindings, sessionId: string) => {
    const stripe = stripeClient(env);

    let session: Stripe.Checkout.Session;
    try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
        if (err instanceof Stripe.errors.StripeInvalidRequestError) {
            throw new HTTPException(404, { message: 'Purchase not found' });
        }
        throw err;
    }

    // metadata.plan is only set by createStripeSession, which excludes other
    // sessions on the same Stripe account
    const plan = session.metadata?.plan;
    const email = session.customer_details?.email ?? session.customer_email;
    if (!isPaidPlan(plan) || !email) {
        throw new HTTPException(404, { message: 'Purchase not found' });
    }

    const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
    if (session.status !== 'complete' || !paid) {
        throw new HTTPException(402, { message: 'Payment has not completed yet. Please try again shortly.' });
    }

    return { email, plan };
};
