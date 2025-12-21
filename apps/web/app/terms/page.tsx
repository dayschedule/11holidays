import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Terms of Service - 11holidays.com',
  description:
    'Terms of service and conditions for using the 11holidays.com API and services.',
};

export default function TermsPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-[800px] space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: December 20, 2025
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the 11holidays.com API and services, you
                agree to be bound by these Terms of Service. If you do not agree
                to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">2. Use of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may use our API and services for lawful purposes only. You
                agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Resell or redistribute our data without permission</li>
                <li>Use the service to spam or harass others</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">3. API Usage</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the API is subject to rate limits and usage
                restrictions based on your subscription plan. Excessive use may
                result in temporary or permanent suspension of access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">4. API Keys</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your
                API keys. You must not share your API keys with unauthorized
                parties. You are responsible for all activity that occurs under
                your API keys.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">5. Data Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate and up-to-date holiday
                information, we do not guarantee the accuracy, completeness, or
                reliability of the data. Holiday dates may change due to
                government decisions or other factors beyond our control.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">6. Payment and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Payment is required for premium plans. We offer a 14-day
                money-back guarantee for new subscriptions. Refund requests must
                be submitted within 14 days of purchase. Lifetime plans are
                subject to the same refund policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">
                7. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The 11holidays.com service, including its original content,
                features, and functionality, is owned by 11holidays.com and is
                protected by international copyright, trademark, and other
                intellectual property laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall 11holidays.com be liable for any indirect,
                incidental, special, consequential, or punitive damages
                resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">
                9. Service Modifications
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part
                of our service at any time. We will provide reasonable notice of
                significant changes when possible.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to our service
                immediately, without prior notice, for any violation of these
                Terms of Service or for any other reason at our discretion.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">11. Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of our service is also governed by our Privacy Policy.
                We collect and use personal information as described in our
                Privacy Policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to update these Terms of Service at any
                time. We will notify users of any material changes by posting
                the new terms on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with applicable laws, without regard to its conflict of law
                provisions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">
                14. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <p className="text-muted-foreground">
                Email:{' '}
                <a
                  href="mailto:legal@11holidays.com"
                  className="text-primary hover:underline"
                >
                  support@11holidays.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By using 11holidays.com, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
