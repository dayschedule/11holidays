import { Check, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Country } from '../lib/countries-data';
import { InternalLinksAd } from './internal-link-ads';

interface SidebarProps {
  country?: Country;
}

export function AdSidebar({ country }: SidebarProps) {
  return (
    <div className="space-y-6">
      {country && <InternalLinksAd country={country} />}
      <Card className="sticky top-6 border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center">
            <Badge variant="outline" className="text-xs mb-4">
              Ads
            </Badge>
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <CalendarClock className="h-5 w-5 text-primary" />
              DaySchedule
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Create your free appointment booking page
            </p>
            <div className="space-y-3 mb-6 text-left w-full max-w-xs">
              {[
                'Easy online booking',
                'Automated reminders',
                'Client management',
                'Free forever',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Button className="w-full max-w-xs" asChild>
              <a
                href="https://dayschedule.com/?utm_source=11holidays"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                Create Appointment Page
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
