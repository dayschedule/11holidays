import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, HelpCircle, Github } from 'lucide-react';

export const metadata = {
  title: 'Contact Us - 11holidays.com',
  description:
    "Get in touch with the 11holidays.com team. We're here to help with questions, support, and feedback.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Contact Us
        </h1>
        <p className="text-lg text-muted-foreground">
          Have a question or feedback? We'd love to hear from you.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Email Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              For general inquiries
            </p>
            <a
              href="mailto:support@dayschedule.com"
              className="text-sm text-primary underline"
            >
              support@dayschedule.com
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Github className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Open an Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              For technical support
            </p>
            <a
              href="https://github.com/dayschedule/11holidays/issues"
              className="text-sm text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              Go to Github
            </a>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Frequently Asked</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">
              How quickly will I get a response?
            </h3>
            <p className="text-sm text-muted-foreground">
              We aim to respond to all inquiries within 24-48 hours during
              business days. Premium subscribers receive priority support.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              What should I include in a support request?
            </h3>
            <p className="text-sm text-muted-foreground">
              Please email from your original email you&apos;ve registered, a
              description of the issue, any error messages, and steps to
              reproduce the problem.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Do you offer phone support?</h3>
            <p className="text-sm text-muted-foreground">
              Currently, we provide support via email only. This allows us to
              better document and track issues for faster resolution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
