import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Code, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About Us - 11holidays.com',
  description:
    'Learn about 11holidays.com, the comprehensive public holidays API for developers and businesses worldwide.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          About us
        </h1>
        <p className="text-lg text-muted-foreground max-w-[700px] mx-auto">
          We provide reliable, up-to-date public holiday data for developers and
          businesses worldwide.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Mission</h2>

            <p className="text-muted-foreground leading-relaxed">
              Inspired by the{' '}
              <a
                href="https://en.wikipedia.org/wiki/Federal_holidays_in_the_United_States"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                11 Federal holidays in the United States
              </a>
              , our name reflects our goal of creating a centralized hub for
              public holidays across countries.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              At 11holidays.com, our mission is to make it simple for developers
              and businesses to access accurate public holiday information from
              around the world. We believe that having reliable holiday data
              shouldn&apos;t be complicated or expensive.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Whether you&apos;re building a scheduling app, planning tool, or
              business application, our API provides the holiday data for 230+
              countries you need with minimal effort and maximum reliability.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Globe className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Global Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We cover public holidays for over 30 countries across all
              continents, with regular updates to ensure accuracy and
              completeness.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Code className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Developer-Friendly</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our RESTful API is designed with developers in mind, featuring
              clean documentation, predictable endpoints, and easy integration.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Trusted by Many</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              From startups to enterprises, businesses worldwide rely on our API
              for their holiday data needs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Always Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our team continuously monitors and updates holiday information to
              reflect changes in government schedules and announcements.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Our Data Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We collect and verify holiday data from multiple authoritative
            sources including:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Official government websites and publications</li>
            <li>National labor departments and ministries</li>
            <li>International organizations and standards bodies</li>
            <li>Local authorities and regional governments</li>
          </ul>
          <p className="text-muted-foreground">
            All data is regularly reviewed and updated to ensure accuracy and
            reflect any changes in official holiday schedules.
          </p>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Get in Touch</h2>
        <p className="text-muted-foreground">
          Have questions, ideas, or found a bug? We&apos;d love to hear from
          you.
        </p>
        <Button asChild>
          <a
            href="https://github.com/dayschedule/11holidays/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open a GitHub Issue
          </a>
        </Button>
      </div>
    </div>
  );
}
