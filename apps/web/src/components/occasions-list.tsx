import { Link } from '@tanstack/react-router';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useToday } from '@/hooks/use-today';
import { cn } from '@/lib/utils';
import type { Occasion } from '@/lib/occassion-api';
import { formatDate, getDayOfWeek, occasionParams } from '@/lib/holidays-api';
import { defaultHolidayTheme, getHolidayTheme } from '@/lib/holiday-themes';
import { CountryFlag } from './country-flag';

interface OccasionsListProps {
  occasions: Occasion[];
  className?: string;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

function relativeDays(date: string, today: Date) {
  const diff = differenceInCalendarDays(parseISO(date), today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff <= 60) return `In ${diff} days`;
  return null;
}

export function OccasionsList({
  occasions,
  className,
  emptyMessage = 'No holidays found.',
  columns = 2,
}: OccasionsListProps) {
  if (occasions.length === 0) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{emptyMessage}</p>;
  }

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2',
        columns === 3 && 'lg:grid-cols-3',
        columns === 4 && 'lg:grid-cols-4',
        className
      )}
    >
      {occasions.map((o) => (
        <OccasionCard key={`${o.occasion_id}-${o.date}`} occasion={o} />
      ))}
    </div>
  );
}

export function OccasionCard({ occasion: o }: { occasion: Occasion }) {
  const theme = getHolidayTheme(o.name, o.country) ?? defaultHolidayTheme;
  const badge = relativeDays(o.date, useToday());

  return (
    <Link
      to="/holidays/$country/$slug"
      params={occasionParams(o.url)}
      className="group relative block overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden" style={{ background: theme.background }}>
        {o.image?.url ? (
          <img
            src={o.image.thumb ?? o.image.url}
            alt={o.image.alt ?? o.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl drop-shadow">{theme.particles[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
        {o.country && (
          <CountryFlag
            countryCode={o.country}
            className="absolute left-3 top-3 h-4 w-6 rounded-[3px] shadow ring-1 ring-white/50"
          />
        )}
        {badge && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-900 shadow">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <h3 className="line-clamp-1 font-semibold group-hover:text-primary">{o.name}</h3>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(o.date)}</span>
          <span className="hidden sm:inline">· {getDayOfWeek(o.date).slice(0, 3)}</span>
        </div>
      </div>
    </Link>
  );
}
