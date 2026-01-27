import Stripe from "stripe";
import { Bindings } from "../types/binding";

const stripeClient = (env: Bindings) => {
    return new Stripe(env.STRIPE_SECRET_KEY);
};

const PRICE_MAP: Record<'Pro' | 'Lifetime', string> = {
    Pro: 'price_1QLNmESFMLczVMp38i9px40b',
    Lifetime: 'price_1Su6HZSFMLczVMp32G7w86rm',
};

export const createStripeSession = async (
    env: Bindings,
    email: string,
    plan: 'Pro' | 'Lifetime'
) => {
    const stripe = stripeClient(env);
    return await stripe.checkout.sessions.create({
        mode: plan === 'Pro' ? 'subscription' : 'payment',
        customer_email: email,
        line_items: [
            {
                price: PRICE_MAP[plan],
                quantity: 1,
            },
        ],
        success_url: `https://11holidays.com/api-key?step=generate&email=${email}`,
        cancel_url: `https://11holidays.com/api-key`,
        metadata: {
            plan,
        },
    });
};