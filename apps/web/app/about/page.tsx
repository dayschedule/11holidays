import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Code, Users, Zap } from "lucide-react"

export const metadata = {
  title: "About Us - 11holidays.com",
  description: "Learn about 11holidays.com, the comprehensive public holidays API for developers and businesses worldwide.",
}

export default function AboutPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-[900px] space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            About 11holidays.com
          </h1>
          <p className="text-lg text-muted-foreground max-w-[700px] mx-auto">
            We provide reliable, up-to-date public holiday data for developers and businesses worldwide.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At 11holidays.com, our mission is to make it simple for developers and businesses to access accurate public holiday information from around the world. We believe that having reliable holiday data shouldn't be complicated or expensive.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're building a scheduling app, planning tool, or business application, our API provides the holiday data you need with minimal effort and maximum reliability.
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
                We cover public holidays for over 30 countries across all continents, with regular updates to ensure accuracy and completeness.
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
                Our RESTful API is designed with developers in mind, featuring clean documentation, predictable endpoints, and easy integration.
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
                From startups to enterprises, businesses worldwide rely on our API for their holiday data needs.
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
                Our team continuously monitors and updates holiday information to reflect changes in government schedules and announcements.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose Us?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Accurate Data</h3>
                <p className="text-sm text-muted-foreground">
                  We source our holiday information from official government sources and maintain strict quality control.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Simple Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Get started in minutes with our straightforward API and comprehensive documentation.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Reliable Performance</h3>
                <p className="text-sm text-muted-foreground">
                  Our infrastructure ensures 99.9% uptime with fast response times around the globe.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Fair Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Transparent, affordable pricing with no hidden fees or surprise charges.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We collect and verify holiday data from multiple authoritative sources including:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Official government websites and publications</li>
              <li>National labor departments and ministries</li>
              <li>International organizations and standards bodies</li>
              <li>Local authorities and regional governments</li>
            </ul>
            <p className="text-muted-foreground">
              All data is regularly reviewed and updated to ensure accuracy and reflect any changes in official holiday schedules.
            </p>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Get in Touch</h2>
          <p className="text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <p className="text-sm text-muted-foreground">
            Contact us at: <a href="mailto:hello@11holidays.com" className="text-primary hover:underline">hello@11holidays.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
