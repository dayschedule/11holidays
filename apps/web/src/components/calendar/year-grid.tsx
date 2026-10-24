import { Link } from '@tanstack/react-router';
import { generateCalendarDays, getMonthName, getWeekDays, type CalendarHoliday, type WeekStart } from '@/lib/calendar-utils';
import { holidayKind, occasionParams } from '@/lib/holidays-api';
import { cn } from '@/lib/utils';

const kindClass = {
  public: 'bg-holiday-public text-white',
  local: 'bg-holiday-local text-gray-900',
  other: 'bg-holiday-other/80 text-white',
} as const;

interface MonthGridProps {
  year: number;
  month: number;
  holidays: CalendarHoliday[];
  weekStart?: WeekStart;
  highlight?: string;
  className?: string;
}

/** Interactive month grid used on web pages (not for printing) */
export function MonthGrid({ year, month, holidays, weekStart = 'sun', highlight, className }: MonthGridProps) {
  const days = generateCalendarDays(year, month, holidays, weekStart);

  return (
    <div className={cn('rounded-2xl border bg-card p-3 shadow-xs', className)}>
      <h3 className="mb-2 px-1 text-sm font-semibold">
        {getMonthName(month)} <span className="text-muted-foreground">{year}</span>
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
        {getWeekDays(weekStart, 'narrow').map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const holiday = day.holidays[0];
          const kind = holiday ? holidayKind(holiday.type) : null;
          const cellClass = cn(
            'relative flex aspect-square items-center justify-center rounded-md text-xs transition-colors',
            !day.isCurrentMonth && 'opacity-25',
            day.isCurrentMonth && !holiday && day.isWeekend && 'text-muted-foreground',
            kind && kindClass[kind],
            !holiday && day.isCurrentMonth && 'hover:bg-muted',
            day.isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-card',
            highlight === day.key && 'scale-110 shadow-lg ring-2 ring-festive-gold'
          );
          const title = day.holidays.map((h) => h.name).join(', ');

          if (holiday?.url) {
            return (
              <Link
                key={day.key}
                to="/holidays/$country/$slug"
                params={occasionParams(holiday.url)}
                title={title}
                className={cn(cellClass, 'font-semibold hover:opacity-80')}
              >
                {day.day}
              </Link>
            );
          }
          return (
            <span key={day.key} title={title || undefined} className={cn(cellClass, holiday && 'font-semibold')}>
              {day.day}
              {day.holidays.length > 1 && (
                <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-current" />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function YearGrid({
  year,
  holidays,
  weekStart = 'sun',
}: {
  year: number;
  holidays: CalendarHoliday[];
  weekStart?: WeekStart;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }, (_, m) => (
        <MonthGrid key={m} year={year} month={m} holidays={holidays} weekStart={weekStart} />
      ))}
    </div>
  );
}

export function HolidayLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-holiday-public" /> Public / national
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-holiday-local" /> Local / regional
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-holiday-other/80" /> Observance / other
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded ring-2 ring-primary" /> Today
      </span>
    </div>
  );
}
