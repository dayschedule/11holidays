import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiKeySignup from '@/components/signup';

export const metadata = {
  title: 'Get API Key for Holidays API - 11holidays.com',
  description:
    'Sign up for a free API key to access holiday data for 230+ countries. Start integrating holidays data with your apps today.',
};

export default function ApiKeyPage() {

  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Get Your Holidays API Key
        </h1>
        <p className="text-lg text-muted-foreground">
          Access holiday data for 230+ countries with our API
        </p>
      </div>

      <ApiKeySignup />

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="block rounded bg-muted p-2 text-sm">
              https://api.11holidays.com/v1
            </code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Endpoints</h3>
            <div className="space-y-2">
              <code className="block rounded bg-muted p-2 text-sm">
                GET /holidays?country=US&year=2026
              </code>
              <code className="block rounded bg-muted p-2 text-sm">
                GET /countries
              </code>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Include your API key in the request header:
            </p>
            <code className="block rounded bg-muted p-2 text-sm mt-2">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
