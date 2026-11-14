import type { ReactNode } from 'react';
import { Moon, Sun, Sunrise } from 'lucide-react';
import { useHour12, useNow } from '@/hooks/use-now';
import { dayPhase, formatClock, zonedParts } from '@/lib/time';
import { cn } from '@/lib/utils';

export function StatCard({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-card p-4 shadow-xs', className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Ticks itself, so a table of clocks doesn't re-render the page around it */
export function LiveClock({ timeZone, seconds = false, className }: { timeZone: string; seconds?: boolean; className?: string }) {
  const now = useNow(seconds ? 1000 : 10_000);
  const [hour12] = useHour12();
  return (
    <span className={cn('tabular-nums', className)} suppressHydrationWarning>
      {formatClock(zonedParts(now, timeZone), hour12, seconds)}
    </span>
  );
}

export function HourFormatToggle({ className }: { className?: string }) {
  const [hour12, setHour12] = useHour12();
  return (
    <div role="group" aria-label="Clock format" className={cn('no-print inline-flex rounded-lg border p-0.5 text-xs font-medium', className)}>
      {[false, true].map((value) => (
        <button
          key={String(value)}
          type="button"
          aria-pressed={hour12 === value}
          onClick={() => setHour12(value)}
          className={cn('rounded-md px-2.5 py-1', hour12 === value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
        >
          {value ? '12h' : '24h'}
        </button>
      ))}
    </div>
  );
}

export function DayPhaseIcon({ hour, className }: { hour: number; className?: string }) {
  const phase = dayPhase(hour);
  const Icon = phase === 'night' ? Moon : phase === 'edge' ? Sunrise : Sun;
  return <Icon className={cn('h-4 w-4', phase === 'night' ? 'text-festive-violet' : 'text-festive-saffron', className)} aria-hidden />;
}
