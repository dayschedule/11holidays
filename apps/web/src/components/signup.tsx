import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Check, Copy, Loader2 } from 'lucide-react';

const API_URL = 'https://api.11holidays.com/v1';

const PLANS = [
  {
    id: 'Pro',
    name: 'Pro Plan',
    description: 'Annual subscription',
    price: '$99',
    period: '/year',
    cta: 'Buy Pro',
    features: [
      'Unlimited API requests',
      'Access to all 230+ countries',
      'Commercial use allowed',
    ],
  },
  {
    id: 'Lifetime',
    name: 'Lifetime Access',
    description: 'One-time payment',
    price: '$249',
    period: 'forever',
    cta: 'Get Lifetime Access',
    features: [
      'All Pro Plan features',
      'No recurring payments',
      'Priority support',
    ],
  },
] as const;

interface ApiKeySignupProps {
  sessionId?: string;
}

const postJson = async <T,>(path: string, body: unknown, fallbackError: string) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json<{ message?: string }>().catch(() => null);
    throw new Error(data?.message || fallbackError);
  }

  return response.json<T>();
};

export default function ApiKeySignup({ sessionId }: ApiKeySignupProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Redirect to Stripe, which collects the email and payment
  const handleCheckout = async (selectedPlan: 'Pro' | 'Lifetime') => {
    setLoading(true);
    setError('');

    try {
      const data = await postJson<{ url: string }>(
        '/auth/checkout',
        { plan: selectedPlan },
        'Failed to create checkout session',
      );
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  // The API verifies the purchase with Stripe before returning the key
  const handleGenerateKey = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await postJson<{ api_key: string }>(
        '/auth/apikey',
        { session_id: sessionId },
        'Failed to generate API key',
      );
      setApiKey(user.api_key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Key generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Copy API key to clipboard
  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const errorAlert = error && (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (!sessionId) {
    return (
      <div className="flex flex-col gap-4">
        {errorAlert}
        {PLANS.map((plan) => (
          <Card key={plan.id} className="transition-colors hover:border-primary">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm">
                      <Check className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 sm:w-52 sm:flex-shrink-0 sm:text-right">
                <p>
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {' '}
                    {plan.period}
                  </span>
                </p>
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          <CardTitle>Thanks for your purchase</CardTitle>
        </div>
        <CardDescription>Generate your API key to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorAlert}
        <div className="space-y-4">
          {!apiKey ? (
            <Button
              onClick={handleGenerateKey}
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Key...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Generate API Key
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Your API key has been generated successfully!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="apiKey">Your API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    readOnly
                    className="font-mono pr-10"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={handleCopyKey}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep this key secure, and don&apos;t share this page&apos;s
                  URL because it shows your key.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
