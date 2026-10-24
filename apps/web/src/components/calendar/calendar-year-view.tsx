import { CalendarMonth, CalendarDay } from '@/lib/calendar-utils';

interface CalendarYearViewProps {
  months: CalendarMonth[];
  year: number;
  theme: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    holiday: string;
  };
  heading?: string;
}

export function CalendarYearView({
  months,
  year,
  theme,
  heading,
}: CalendarYearViewProps) {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div
      className="w-full p-8 rounded-lg"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        minWidth: '800px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {heading && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold" style={{ color: theme.primary }}>
            {heading}
          </h2>
        </div>
      )}

      <div className="mb-6 text-center">
        <h3 className="text-4xl font-bold" style={{ color: theme.primary }}>
          {year}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {months.map((month) => (
          <div key={month.number} className="space-y-2">
            <h4
              className="text-center font-bold text-sm"
              style={{ color: theme.primary }}
            >
              {month.name}
            </h4>

            <div className="grid grid-cols-7 gap-1 text-[10px]">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className="text-center font-semibold"
                  style={{ color: theme.primary }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {month.days.map((day, index) => (
                <MiniCalendarDayCell key={index} day={day} theme={theme} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <h4 className="font-semibold" style={{ color: theme.primary }}>
          Holidays by Month:
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {months.map((month) => {
            const monthHolidays = month.days.filter(
              (d) => d.holiday && d.isCurrentMonth
            );
            if (monthHolidays.length === 0) return null;

            return (
              <div key={month.number}>
                <h5
                  className="font-semibold mb-1"
                  style={{ color: theme.primary }}
                >
                  {month.name}
                </h5>
                <ul className="space-y-0.5 text-xs">
                  {monthHolidays.map((d, i) => (
                    <li key={i}>
                      <span
                        style={{ color: theme.holiday }}
                        className="font-medium"
                      >
                        {d.day}:
                      </span>{' '}
                      {d.holiday?.name}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniCalendarDayCell({
  day,
  theme,
}: {
  day: CalendarDay;
  theme: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    holiday: string;
  };
}) {
  return (
    <div
      className="aspect-square flex items-center justify-center rounded text-[10px] font-medium"
      style={{
        backgroundColor: day.holiday ? theme.holiday : theme.secondary,
        color: day.holiday ? '#ffffff' : theme.text,
        opacity: day.isCurrentMonth ? 1 : 0.3,
      }}
      title={day.holiday?.name}
    >
      {day.day}
    </div>
  );
}
