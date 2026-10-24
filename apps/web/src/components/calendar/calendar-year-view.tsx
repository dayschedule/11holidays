import { getWeekDays, type CalendarDay, type CalendarMonth, type CalendarThemeColors, type WeekStart } from '@/lib/calendar-utils';

interface CalendarYearViewProps {
  months: CalendarMonth[];
  year: number;
  theme: CalendarThemeColors;
  heading?: string;
  weekStart?: WeekStart;
}

export function CalendarHeader({ theme, heading, subtitle }: { theme: CalendarThemeColors; heading?: string; subtitle: string }) {
  return (
    <div
      className="mb-6 rounded-xl px-6 py-5 text-center"
      style={{ backgroundColor: theme.primary, color: '#ffffff' }}
    >
      {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
      <p className="text-4xl font-semibold tracking-[-0.03em]">{subtitle}</p>
    </div>
  );
}

export function dayCellStyle(day: CalendarDay, theme: CalendarThemeColors): React.CSSProperties {
  const holiday = day.holidays[0];
  if (holiday?.custom) {
    return {
      backgroundColor: theme.soft,
      color: theme.primary,
      boxShadow: `inset 0 0 0 1px ${theme.primary}`,
      opacity: day.isCurrentMonth ? 1 : 0.25,
    };
  }
  return {
    backgroundColor: holiday ? theme.holiday : theme.secondary,
    color: holiday ? '#ffffff' : theme.text,
    opacity: day.isCurrentMonth ? 1 : 0.25,
  };
}

export function CalendarYearView({ months, year, theme, heading, weekStart = 'sun' }: CalendarYearViewProps) {
  const weekDays = getWeekDays(weekStart, 'narrow');

  return (
    <div
      className="w-full p-8"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        minWidth: '820px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <CalendarHeader theme={theme} heading={heading} subtitle={String(year)} />

      <div className="grid grid-cols-4 gap-x-6 gap-y-5">
        {months.map((month) => (
          <div key={month.number} className="space-y-1.5">
            <h4 className="text-center text-sm font-bold" style={{ color: theme.primary }}>
              {month.name}
            </h4>
            <div className="grid grid-cols-7 gap-0.5 text-[9px]">
              {weekDays.map((day, i) => (
                <div key={i} className="text-center font-semibold" style={{ color: theme.primary }}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {month.days.map((day) => (
                <div
                  key={day.key}
                  className="flex aspect-square items-center justify-center rounded text-[9px] font-medium"
                  style={dayCellStyle(day, theme)}
                  title={day.holidays.map((h) => h.name).join(', ') || undefined}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <h4 className="font-semibold" style={{ color: theme.primary }}>
          Holidays
        </h4>
        <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
          {months.map((month) => {
            const monthHolidays = month.days.filter((d) => d.holidays.length);
            if (monthHolidays.length === 0) return null;

            return (
              <div key={month.number}>
                <h5 className="mb-1 font-semibold" style={{ color: theme.primary }}>
                  {month.name}
                </h5>
                <ul className="space-y-0.5 text-xs">
                  {monthHolidays.flatMap((d) =>
                    d.holidays.map((h) => (
                      <li key={h.id}>
                        <span style={{ color: h.custom ? theme.custom : theme.holiday }} className="font-semibold">
                          {d.day}
                        </span>{' '}
                        {h.name}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-right text-[10px]" style={{ opacity: 0.5 }}>
        Made with 11holidays.com
      </p>
    </div>
  );
}
