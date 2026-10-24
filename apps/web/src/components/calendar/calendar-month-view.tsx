import { CalendarDay, CalendarMonth } from '@/lib/calendar-utils';

interface CalendarMonthViewProps {
  month: CalendarMonth;
  theme: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    holiday: string;
  };
  heading?: string;
  showYear?: boolean;
  year?: number;
}

export function CalendarMonthView({
  month,
  theme,
  heading,
  showYear = true,
  year,
}: CalendarMonthViewProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className="w-full p-8 rounded-lg"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        minWidth: '600px',
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

      <div className="mb-4 text-center">
        <h3 className="text-3xl font-bold" style={{ color: theme.primary }}>
          {month.name} {showYear && year}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-sm py-2"
            style={{ color: theme.primary }}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {month.days.map((day, index) => (
          <CalendarDayCell key={index} day={day} theme={theme} />
        ))}
      </div>

      {month.days.some((d) => d.holiday) && (
        <div className="mt-6 space-y-2">
          <h4
            className="font-semibold text-sm"
            style={{ color: theme.primary }}
          >
            Holidays:
          </h4>
          <div className="space-y-1">
            {month.days
              .filter((d) => d.holiday && d.isCurrentMonth)
              .map((d, i) => (
                <div key={i} className="text-sm flex items-start gap-2">
                  <span
                    className="font-medium"
                    style={{ color: theme.holiday }}
                  >
                    {d.day}:
                  </span>
                  <span>{d.holiday?.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarDayCell({
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
      className="aspect-square flex flex-col items-center justify-center p-1 rounded text-sm relative"
      style={{
        backgroundColor: day.holiday ? theme.holiday : theme.secondary,
        color: day.holiday ? '#ffffff' : theme.text,
        opacity: day.isCurrentMonth ? 1 : 0.3,
      }}
    >
      <span className="font-medium">{day.day}</span>
      {day.holiday && (
        <span className="text-[8px] leading-tight text-center mt-0.5 line-clamp-2">
          {day.holiday.name.split(' ').slice(0, 2).join(' ')}
        </span>
      )}
    </div>
  );
}
