import { useEffect, useState } from "react";

const RECAPTCHA_KEY = '6Ld2icwtAAAAAOeJg2Afxnp3HyF4EdYDMJ8betYD';

declare global {
    interface Window {
        grecaptcha?: {
            enterprise: {
                ready(callback: () => void): void;
                execute(
                    siteKey: string,
                    options: { action: string }
                ): Promise<string>;
            };
        };
    }
}

export function useRecaptcha() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (window.grecaptcha?.enterprise) {
            window.grecaptcha.enterprise.ready(() => setIsLoaded(true));
            return;
        }

        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_KEY}`;
        script.async = true;

        script.onload = () => {
            window.grecaptcha?.enterprise.ready(() => {
                setIsLoaded(true);
            });
        };

        document.body.appendChild(script);

        return () => {
            script.remove();
        };
    }, []);

    const executeRecaptcha = async (action: string) => {
        if (!isLoaded || !window.grecaptcha?.enterprise) {
            return null;
        }

        return window.grecaptcha.enterprise.execute(RECAPTCHA_KEY, {
            action,
        });
    };

    return { executeRecaptcha, isLoaded };
}