import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, HelpCircle } from "lucide-react"

export const metadata = {
  title: "Contact Us - 11holidays.com",
  description: "Get in touch with the 11holidays.com team. We're here to help with questions, support, and feedback.",
}

export default function ContactPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-[900px] space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Email Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                For general inquiries
              </p>
              <a href="mailto:hello@11holidays.com" className="text-sm text-primary hover:underline">
                hello@11holidays.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <HelpCircle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                For technical support
              </p>
              <a href="mailto:support@11holidays.com" className="text-sm text-primary hover:underline">
                support@11holidays.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Share your thoughts
              </p>
              <a href="mailto:feedback@11holidays.com" className="text-sm text-primary hover:underline">
                feedback@11holidays.com
              </a>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What is this about?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more..."
                  className="min-h-[150px]"
                />
              </div>
              <Button type="submit" size="lg" className="w-full md:w-auto">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Inquiries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Interested in enterprise solutions or partnerships?
              </p>
              <a href="mailto:business@11holidays.com" className="text-sm text-primary hover:underline">
                business@11holidays.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Found incorrect holiday information? Let us know.
              </p>
              <a href="mailto:data@11holidays.com" className="text-sm text-primary hover:underline">
                data@11holidays.com
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
              <h3 className="font-semibold mb-1">How quickly will I get a response?</h3>
              <p className="text-sm text-muted-foreground">
                We aim to respond to all inquiries within 24-48 hours during business days. Premium subscribers receive priority support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">What should I include in a support request?</h3>
              <p className="text-sm text-muted-foreground">
                Please include your API key (if applicable), a description of the issue, any error messages, and steps to reproduce the problem.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Do you offer phone support?</h3>
              <p className="text-sm text-muted-foreground">
                Currently, we provide support via email only. This allows us to better document and track issues for faster resolution.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
