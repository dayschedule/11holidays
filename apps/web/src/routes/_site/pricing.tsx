import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Check } from 'lucide-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@/components/page-layout';
import { SITE_URL, seo, webApiSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_site/pricing')({
  head: () =>
    seo({
      title: 'Pricing - 11holidays.com',
      description:
        'Simple, transparent pricing for our holidays API. Choose between yearly or lifetime access.',
      path: '/pricing',
      jsonLd: [
        {
          ...webApiSchema(),
          offers: [
            { '@type': 'Offer', name: 'Yearly Plan', price: '99', priceCurrency: 'USD', url: `${SITE_URL}/api-key` },
            { '@type': 'Offer', name: 'Lifetime Plan', price: '249', priceCurrency: 'USD', url: `${SITE_URL}/api-key` },
          ],
        },
      ],
    }),
  component: PricingPage,
});

const MOBILE_FEATURE_COUNT = 4;

const PLANS = [
  {
    name: 'Yearly Plan',
    description: 'Perfect for ongoing projects',
    price: '$99',
    period: '/year',
    features: [
      'Unlimited API requests',
      'Access to all 230+ countries',
      'JSON & CSV download formats',
      'Historical data access',
      'Email support',
      'Regular updates',
      'Commercial use allowed',
    ],
  },
  {
    name: 'Lifetime Plan',
    description: 'One-time payment, forever access',
    price: '$249',
    period: '/lifetime',
    badge: 'Best Value',
    features: [
      'All Yearly Plan features',
      'Lifetime access - pay once',
      'No recurring payments',
      'Priority support',
      'Early access to new features',
      'Custom integration support',
      'Future updates included',
    ],
  },
];

function PricingPage() {
  return (
    <PageLayout sidebar={false}>
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-4xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that works best for you
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={cn(plan.badge && 'border-primary')}>
            <CardContent className="grid gap-6 md:grid-cols-[18rem_1fr] md:gap-8">
              <div className="flex flex-col gap-4 md:border-r md:pr-8">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {plan.badge && (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div>
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/api-key">Buy Now</Link>
                </Button>
              </div>

              <div className="space-y-3 self-center">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={feature}
                      className={cn(
                        'items-start',
                        index < MOBILE_FEATURE_COUNT ? 'flex' : 'hidden sm:flex',
                      )}
                    >
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground sm:hidden">
                  +{plan.features.length - MOBILE_FEATURE_COUNT} more included
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            See the endpoints, parameters and example responses before you buy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link to="/docs/api">
              <BookOpen className="mr-2 h-4 w-4" />
              Read the API docs
            </Link>
          </Button>
        </CardContent>
      </Card>

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
                Refunds are not available once your API key has been used to
                fetch or download holiday data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
