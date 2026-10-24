import { useEffect, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';
import type { HolidayTheme } from '@/lib/holiday-themes';
import { cn } from '@/lib/utils';

/** Deterministic pseudo-random so server and client render the same particles */
function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface FestiveParticlesProps {
  theme: Pick<HolidayTheme, 'particles' | 'motion'>;
  count?: number;
  className?: string;
}

export function FestiveParticles({ theme, count = 18, className }: FestiveParticlesProps) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {Array.from({ length: count }, (_, i) => {
        const left = seeded(i + 1) * 100;
        const top = theme.motion === 'twinkle' ? seeded(i + 31) * 90 : theme.motion === 'rise' ? 85 + seeded(i + 7) * 15 : -5;
        const size = 14 + seeded(i + 13) * 22;
        const duration = (theme.motion === 'twinkle' ? 2.5 : 8) + seeded(i + 21) * 6;
        const delay = -seeded(i + 3) * duration;
        return (
          <span
            key={i}
            className="festive-particle"
            data-motion={theme.motion}
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                fontSize: `${size}px`,
                '--dur': `${duration}s`,
                '--delay': `${delay}s`,
              } as React.CSSProperties
            }
          >
            {theme.particles[i % theme.particles.length]}
          </span>
        );
      })}
    </div>
  );
}

function splitSeconds(total: number) {
  const s = Math.max(0, total);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

interface CountdownProps {
  date: string;
  className?: string;
  /** Visual style of the number tiles */
  variant?: 'glass' | 'card';
}

/** Live countdown to the start (local midnight) of a holiday */
export function Countdown({ date, className, variant = 'glass' }: CountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const target = parseISO(date);
  const remaining = now ? differenceInSeconds(target, now) : null;

  if (remaining !== null && remaining <= 0 && remaining > -86400) {
    return (
      <div className={cn('text-lg font-semibold', className)}>🎉 It&apos;s happening today!</div>
    );
  }
  if (remaining !== null && remaining <= -86400) return null;

  const parts = remaining === null ? null : splitSeconds(remaining);
  const units = [
    { label: 'Days', value: parts?.days },
    { label: 'Hours', value: parts?.hours },
    { label: 'Mins', value: parts?.minutes },
    { label: 'Secs', value: parts?.seconds },
  ];

  return (
    <div className={cn('flex gap-2 sm:gap-3', className)} role="timer" aria-live="off">
      {units.map((u) => (
        <div
          key={u.label}
          className={cn(
            'flex min-w-[64px] flex-col items-center rounded-xl px-3 py-2 sm:min-w-[76px]',
            variant === 'glass'
              ? 'bg-white/15 ring-1 ring-white/25 backdrop-blur-md'
              : 'border bg-background shadow-xs'
          )}
        >
          <span className="text-2xl font-bold tabular-nums sm:text-3xl">
            {u.value === undefined ? '--' : String(u.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
