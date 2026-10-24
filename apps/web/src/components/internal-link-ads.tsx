import {
  CalendarDays,
  Palmtree,
  ListOrdered,
  FileDown,
  FileSpreadsheet,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Country } from '../lib/countries-data';
import { currentYear } from '../lib/holidays-api';
import Link from 'next/link';
import Script from 'next/script';

type AdCard = {
  to: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  tone: string;
};

interface InternalLinksAdProps {
  country: Country;
  className?: string;
}

export function InternalLinksAd({ country, className }: InternalLinksAdProps) {
  const code = country.code.toLowerCase();

  const cards: AdCard[] = [
    {
      to: `/calendars/${country.slug}`,
      title: `${country.name} holidays calendar`,
      description: 'Download a printable PDF calendar',
      cta: 'Get PDF',
      icon: FileDown,
      tone: 'from-rose-500/15 to-orange-500/15 text-rose-600 dark:text-rose-400',
    },
    {
      to: `/holidays/${code}/${currentYear}`,
      title: `All holidays in ${country.name} ${currentYear}`,
      description: 'Export the full list to Excel',
      cta: 'Download Excel',
      icon: FileSpreadsheet,
      tone: 'from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400',
    },
    {
      to: `/long-weekends/${country.slug}`,
      title: `Long weekends in ${country.name}`,
      description: 'Plan trips with minimum leaves',
      cta: 'Plan now',
      icon: Palmtree,
      tone: 'from-sky-500/15 to-indigo-500/15 text-sky-600 dark:text-sky-400',
    },
    {
      to: `/upcoming-holidays/${country.slug}`,
      title: 'Upcoming holidays',
      description: "See what's next on the calendar",
      cta: 'View list',
      icon: CalendarDays,
      tone: 'from-amber-500/15 to-yellow-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      to: `/holidays/${code}`,
      title: `Browse ${country.name} holidays`,
      description: 'Explore every observance',
      cta: 'Browse',
      icon: ListOrdered,
      tone: 'from-fuchsia-500/15 to-purple-500/15 text-fuchsia-600 dark:text-fuchsia-400',
    },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Explore
        </span>
        <Badge variant="outline" className="text-[10px]">
          Free
        </Badge>
      </div>

      {cards.map((c, i) => {
        const Icon = c.icon;

        if (i === 2) {
          return (
            <>
              <div>
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client="ca-pub-8402459453084519"
                  data-ad-slot="3528829817"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
                <Script strategy="afterInteractive" id="adsbygoogle-init">
                  {`
                    (adsbygoogle = window.adsbygoogle || []).push({});
                  `}
                </Script>
              </div>
            </>
          );
        }

        return (
          <Card
            key={c.to + c.title}
            className="group overflow-hidden transition-colors hover:border-primary/40 py-0"
          >
            <Link href={c.to} className="block">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br',
                      c.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight line-clamp-2">
                      {c.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {c.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      {c.cta}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
