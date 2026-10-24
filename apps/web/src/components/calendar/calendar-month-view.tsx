import { getWeekDays, type CalendarMonth, type CalendarThemeColors, type WeekStart } from '@/lib/calendar-utils';
import { CalendarHeader, dayCellStyle } from './calendar-year-view';

interface CalendarMonthViewProps {
  month: CalendarMonth;
  theme: CalendarThemeColors;
  heading?: string;
  year: number;
  weekStart?: WeekStart;
}

export function CalendarMonthView({ month, theme, heading, year, weekStart = 'sun' }: CalendarMonthViewProps) {
  const weekDays = getWeekDays(weekStart);
  const monthHolidays = month.days.filter((d) => d.holidays.length);

  return (
    <div
      className="w-full p-8"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        minWidth: '640px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <CalendarHeader theme={theme} heading={heading} subtitle={`${month.name} ${year}`} />

      <div className="mb-2 grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-semibold" style={{ color: theme.primary }}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {month.days.map((day) => (
          <div
            key={day.key}
            className="relative flex aspect-[4/3] flex-col items-start justify-between rounded-lg p-2 text-sm"
            style={dayCellStyle(day, theme)}
          >
            <span className="font-bold">{day.day}</span>
            {day.holidays.length > 0 && (
              <span className="line-clamp-2 text-[10px] font-medium leading-tight">
                {day.holidays.map((h) => h.name).join(' · ')}
              </span>
            )}
          </div>
        ))}
      </div>

      {monthHolidays.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold" style={{ color: theme.primary }}>
            Holidays
          </h4>
          <div className="space-y-1">
            {monthHolidays.flatMap((d) =>
              d.holidays.map((h) => (
                <div key={h.id} className="flex items-start gap-2 text-sm">
                  <span className="w-6 font-semibold" style={{ color: h.custom ? theme.custom : theme.holiday }}>
                    {d.day}
                  </span>
                  <span>{h.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <p className="mt-6 text-right text-[10px]" style={{ opacity: 0.5 }}>
        Made with 11holidays.com
      </p>
    </div>
  );
}
