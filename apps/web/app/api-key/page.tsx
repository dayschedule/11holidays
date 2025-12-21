import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Mail } from "lucide-react"

export const metadata = {
  title: "Get Free API Key - 11holidays.com",
  description: "Sign up for a free API key to access holiday data for 30+ countries. Start integrating today.",
}

export default function ApiKeyPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-[800px] space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Get Your Free API Key
          </h1>
          <p className="text-lg text-muted-foreground">
            Access holiday data for 30+ countries with our free API
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-6 w-6" />
              <CardTitle>API Key Registration</CardTitle>
            </div>
            <CardDescription>
              Enter your email to receive your free API key instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                />
              </div>
            </div>
            <Button size="lg" className="w-full">
              Get Free API Key
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Free Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  1,000 requests per month
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Access to all countries
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  JSON format
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Basic support
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pro Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited requests
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Multiple formats
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Custom integrations
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

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
                  GET /holidays/:countryCode/:year
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
                X-API-Key: YOUR_API_KEY
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
