import { ApiExamples } from '@/components/api-examples';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaqSection } from '@/components/faq-section';
import ApiKeySignup from '@/components/signup';
import { PageLayout } from '@/components/page-layout';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { currentYear } from '@/lib/holidays-api';
import { SITE_URL, faqSchema, seo, webApiSchema } from '@/lib/seo';
import { z } from 'zod';

const ENDPOINTS = [
  { path: 'GET /holidays?country=US&year=2026', description: 'Holidays for a country and year' },
  { path: 'GET /holidays/{id}', description: 'A single holiday by id' },
  { path: 'GET /countries', description: 'Supported countries' },
  { path: 'GET /occasions', description: 'Holidays and festivals with descriptions' },
];

const USE_CASES = [
  { title: 'HR and leave management', description: 'Show the right public holidays for employees in each country.' },
  { title: 'Payroll', description: 'Account for bank holidays when calculating pay dates and working days.' },
  { title: 'Booking and scheduling', description: 'Block out holidays and plan around closures in your calendars.' },
];

const SAMPLE_RESPONSE = `[
  {
    "holiday_id": 6093,
    "name": "New Year's Day",
    "date": "2026-01-01",
    "description": "...",
    "occasion_id": 6220,
    "country": "US",
    "type": "Federal Holiday"
  }
]`;

const FAQ = [
  {
    q: 'What is the 11holidays Holidays API?',
    a: 'It is a REST API that returns public holidays, bank holidays and observances for 230+ countries as JSON. You request holidays by ISO 3166-1 alpha-2 country code and year.',
  },
  {
    q: 'How do I get a Holidays API key?',
    a: 'Buy the Pro or Lifetime plan on this page. After payment you return here to generate your key, and we also email it to the address you used at checkout.',
  },
  {
    q: 'How much does the Holidays API cost?',
    a: 'The Pro plan is $99 per year and Lifetime access is a one-time payment of $249. Both plans include unlimited API requests and all 230+ countries.',
  },
  {
    q: 'Is there a free Holidays API?',
    a: 'The REST API requires a paid plan. Free iCal calendar feeds for each country are available without an API key.',
  },
  {
    q: 'Which countries does the Holidays API cover?',
    a: 'It covers 230+ countries. Call GET /countries for the full list of supported countries and their codes.',
  },
  {
    q: 'Can I get holidays for past years?',
    a: 'Yes. Historical data is included, so you can request past years with the year parameter.',
  },
  {
    q: 'How do I authenticate API requests?',
    a: 'Send your key in the Authorization header of every request: Authorization: Bearer YOUR_API_KEY.',
  },
  {
    q: 'Is there an SDK or OpenAPI spec?',
    a: 'Yes. Install the official npm package with npm i 11holidays, or generate a client from the OpenAPI 3.0 spec linked in the API docs.',
  },
];

export const Route = createFileRoute('/_site/api-key')({
  validateSearch: z.object({
    session_id: z.string().optional().catch(undefined),
  }),
  head: () =>
    seo({
      title: 'Holidays API Key for 230+ Countries - 11holidays.com',
      description:
        'Get a Holidays API key for public holidays, bank holidays and observances in 230+ countries. Simple REST API with JSON responses, from $99/year.',
      path: '/api-key',
      jsonLd: [
        {
          ...webApiSchema(),
          offers: [
            { '@type': 'Offer', name: 'Pro Plan', price: '99', priceCurrency: 'USD', url: `${SITE_URL}/api-key` },
            { '@type': 'Offer', name: 'Lifetime Access', price: '249', priceCurrency: 'USD', url: `${SITE_URL}/api-key` },
          ],
        },
        faqSchema(FAQ),
      ],
    }),
  component: ApiKeyPage,
});

function ApiKeyPage() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-4xl">
          Get Your Holidays API Key
        </h1>
        <p className="text-lg text-muted-foreground">
          Buy a plan and get instant access to holiday data for 230+ countries
        </p>
      </div>

      <ApiKeySignup sessionId={sessionId} />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">What is the Holidays API?</h2>
        <p className="text-muted-foreground leading-relaxed">
          The 11holidays Holidays API is a REST API for public holidays, bank
          holidays and observances in 230+ countries. Send a GET request with a
          country code and year, and it returns federal, state and local
          holidays as JSON, with each holiday&apos;s name, date, type and
          description.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <Card key={useCase.title}>
              <CardHeader>
                <CardTitle>
                  <h3>{useCase.title}</h3>
                </CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl font-bold">API Documentation</h2>
          </CardTitle>
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
            <dl className="space-y-3">
              {ENDPOINTS.map((endpoint) => (
                <div key={endpoint.path}>
                  <dt>
                    <code className="block rounded bg-muted p-2 text-sm break-all">
                      {endpoint.path}
                    </code>
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {endpoint.description}
                  </dd>
                </div>
              ))}
            </dl>
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
          <div>
            <h3 className="font-semibold mb-2">Example response</h3>
            <pre className="overflow-x-auto rounded bg-muted p-2 text-sm">
              <code>{SAMPLE_RESPONSE}</code>
            </pre>
          </div>
          <Link
            to="/docs/api"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Learn more in the API docs <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      <ApiExamples year={currentYear()} />

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
