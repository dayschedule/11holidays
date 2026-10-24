import { holidayKind } from '@/lib/holidays-api';
import { cn } from '@/lib/utils';

const styles = {
  public: 'bg-holiday-public/12 text-holiday-public ring-holiday-public/25',
  local: 'bg-holiday-local/15 text-amber-700 ring-holiday-local/30 dark:text-holiday-local',
  other: 'bg-holiday-other/12 text-holiday-other ring-holiday-other/25',
} as const;

export function HolidayTypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        styles[holidayKind(type)],
        className
      )}
    >
      {type}
    </span>
  );
}

export function HolidayDot({ type, className }: { type: string; className?: string }) {
  const kind = holidayKind(type);
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 shrink-0 rounded-full',
        kind === 'public' && 'bg-holiday-public',
        kind === 'local' && 'bg-holiday-local',
        kind === 'other' && 'bg-holiday-other',
        className
      )}
    />
  );
}
