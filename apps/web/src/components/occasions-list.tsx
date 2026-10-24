import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Occasion } from '../lib/occassion-api';
import Link from 'next/link';
import { CountryFlag } from './country-flag';
import { formatDate, getDayOfWeek } from '../lib/holidays-api';
import { Calendar } from 'lucide-react';

interface OccasionsListProps {
  occasions: Occasion[];
  className?: string;
  emptyMessage?: string;
}

export function OccasionsList({
  occasions,
  className,
  emptyMessage = 'No holidays found.',
}: OccasionsListProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {occasions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {occasions.map((o) => (
            <Card key={o.occasion_id} className="overflow-hidden group py-0">
              <Link
                href={`/holidays/${o.url}`}
                className="block"
                prefetch={false}
              >
                <AspectRatio ratio={16 / 9} className="bg-muted">
                  {o.image?.url ? (
                    <Image
                      src={o.image.url}
                      alt={o.image?.alt ?? o.name}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6">
                      <CountryFlag
                        countryCode={o.country!}
                        className="h-16 w-auto rounded shadow-sm"
                      />
                    </div>
                  )}
                </AspectRatio>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold group-hover:underline">
                      {o.name}
                    </h3>

                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(o.date)}</span>
                      <span>·</span>
                      <span>{getDayOfWeek(o.date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
