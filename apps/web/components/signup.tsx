'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Key, Mail, Check, Copy, Loader2, Sparkles } from 'lucide-react';

type Step = 'email' | 'otp' | 'upgrade' | 'generate';
type Plan = 'Free' | 'Pro' | 'Lifetime';

interface User {
  name: string;
  email: string;
  api_key: string;
  plan: Plan;
  status: string;
  created_at: string;
}

const API_URL = 'https://api.11holidays.com/v1';

export default function ApiKeySignup() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step') as Step | null;
  const emailParam = searchParams.get('email');

  const [step, setStep] = useState<Step>(stepParam || 'email');
  const [email, setEmail] = useState(emailParam || '');
  const [otp, setOtp] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Update step when query parameter changes (e.g., after Stripe redirect)
  useEffect(() => {
    if (stepParam) {
      setStep(stepParam);
    }
  }, [stepParam]);

  // Update email when query parameter is present
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Step 1: Submit email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const user = await response.json<User>();
      // If user has Free plan, show upgrade options
      if (user.plan === 'Free') {
        setStep('upgrade');
      } else {
        // Otherwise go directly to generate key
        setStep('generate');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Upgrade plan (redirect to Stripe)
  const handleUpgrade = async (selectedPlan: 'Pro' | 'Lifetime') => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: selectedPlan }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json<{ url: string }>();

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
      setLoading(false);
    }
  };

  // Step 4: Generate API key
  const handleGenerateKey = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/apikey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const user = await response.json<User>();
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

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-6 w-6" />
          <CardTitle>API Key Registration</CardTitle>
        </div>
        <CardDescription>
          {step === 'email' &&
            'Enter your email, upgrade plan and receive your API key instantly'}
          {step === 'otp' && 'Enter the verification code sent to your email'}
          {step === 'upgrade' && 'Choose a plan to unlock full API access'}
          {step === 'generate' && 'Generate your API key to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Get API Key'
              )}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Code sent to {email}
              </p>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>
        )}

        {/* Step 3: Upgrade Options */}
        {step === 'upgrade' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Pro Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Annual subscription
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$99</p>
                    <p className="text-sm text-muted-foreground">/year</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUpgrade('Pro')}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Lifetime Access</h3>
                    <p className="text-sm text-muted-foreground">
                      One-time payment
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$249</p>
                    <p className="text-sm text-muted-foreground">forever</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUpgrade('Lifetime')}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Get Lifetime Access'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Generate/Display API Key */}
        {step === 'generate' && (
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
                    Keep this key secure. You won&apos;t be able to see it
                    again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
