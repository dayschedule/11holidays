import { Fragment } from 'react';
import { format, parseISO } from 'date-fns';
import { getMonthName, type CalendarHoliday, type CalendarThemeColors } from '@/lib/calendar-utils';
import { CalendarHeader } from './calendar-year-view';

interface CalendarListViewProps {
  holidays: CalendarHoliday[];
  theme: CalendarThemeColors;
  heading?: string;
  year: number;
}

/** A printable holiday list, e.g. for a company notice board */
export function CalendarListView({ holidays, theme, heading, year }: CalendarListViewProps) {
  const byMonth = holidays.reduce<Record<number, CalendarHoliday[]>>((acc, h) => {
    const m = parseISO(h.date).getMonth();
    (acc[m] ??= []).push(h);
    return acc;
  }, {});

  return (
    <div
      className="w-full p-8"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        minWidth: '600px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <CalendarHeader theme={theme} heading={heading} subtitle={`Holiday list ${year}`} />

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ color: theme.primary, borderBottom: `2px solid ${theme.primary}` }}>
            <th className="w-10 py-2 text-left font-semibold">#</th>
            <th className="py-2 text-left font-semibold">Date</th>
            <th className="py-2 text-left font-semibold">Day</th>
            <th className="py-2 text-left font-semibold">Holiday</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(byMonth).map(([month, list]) => (
            <Fragment key={month}>
              <tr>
                <td colSpan={4} className="pb-1 pt-4 text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
                  {getMonthName(Number(month))}
                </td>
              </tr>
              {list.map((h) => (
                <tr key={h.id} style={{ borderBottom: `1px solid ${theme.secondary}` }}>
                  <td className="py-2" style={{ opacity: 0.6 }}>
                    {holidays.indexOf(h) + 1}
                  </td>
                  <td className="py-2 font-medium">{format(parseISO(h.date), 'd MMM yyyy')}</td>
                  <td className="py-2">{format(parseISO(h.date), 'EEEE')}</td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: h.custom ? theme.custom : theme.holiday }}
                      />
                      {h.name}
                    </span>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      {holidays.length === 0 && <p className="py-10 text-center" style={{ opacity: 0.6 }}>No holidays selected</p>}
      <p className="mt-6 text-right text-[10px]" style={{ opacity: 0.5 }}>
        {holidays.length} holidays · Made with 11holidays.com
      </p>
    </div>
  );
}
