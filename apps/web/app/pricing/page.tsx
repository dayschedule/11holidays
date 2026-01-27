import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - 11holidays.com',
  description:
    'Simple, transparent pricing for our holidays API. Choose between yearly or lifetime access.',
};

export default function PricingPage() {
  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that works best for you
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Yearly Plan</CardTitle>
              <CardDescription>Perfect for ongoing projects</CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold">$99</span>
                <span className="text-muted-foreground">/year</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Unlimited API requests</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Access to all 230+ countries</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>JSON & CSV download formats</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Historical data access</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Email support</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Regular updates</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Commercial use allowed</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/api-key">Buy Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-primary">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">
                Best Value
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Lifetime Plan</CardTitle>
              <CardDescription>
                One-time payment, forever access
              </CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold">$249</span>
                <span className="text-muted-foreground">/lifetime</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>All Yearly Plan features</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Lifetime access - pay once</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Custom integration support</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>No recurring payments</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  <span>Future updates included</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/api-key">Buy Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="grid gap-4 text-left">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Can I switch plans later?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade from a Yearly plan to a Lifetime plan at
                any time. The remaining value of your yearly subscription will
                be credited towards the lifetime plan.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                What payment methods do you accept?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards via Stripe, and bank transfers
                for enterprise customers.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Is there a refund policy?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, we offer a 30-day money-back guarantee. If you&apos;re not
                satisfied with our service, contact us within 14 days for a full
                refund.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
