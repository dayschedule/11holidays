import { format } from 'date-fns';

export interface CalendarHoliday {
  id: string;
  date: string;
  name: string;
  type: string;
  url?: string | null;
  custom?: boolean;
}

export interface CalendarDay {
  date: Date;
  key: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  holidays: CalendarHoliday[];
}

export interface CalendarMonth {
  name: string;
  number: number;
  days: CalendarDay[];
}

export type WeekStart = 'sun' | 'mon';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function getMonthName(month: number): string {
  return MONTHS[month]!;
}

export function getWeekDays(weekStart: WeekStart, style: 'short' | 'narrow' = 'short') {
  const short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = style === 'short' ? short : short.map((d) => d[0]!);
  return weekStart === 'mon' ? [...days.slice(1), days[0]!] : days;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function generateCalendarDays(
  year: number,
  month: number,
  holidays: CalendarHoliday[],
  weekStart: WeekStart = 'sun',
  today: Date = new Date()
): CalendarDay[] {
  const byDate = new Map<string, CalendarHoliday[]>();
  for (const h of holidays) {
    byDate.set(h.date, [...(byDate.get(h.date) ?? []), h]);
  }

  const todayKey = format(today, 'yyyy-MM-dd');
  const firstDay = new Date(year, month, 1).getDay();
  const offset = weekStart === 'mon' ? (firstDay + 6) % 7 : firstDay;
  const start = new Date(year, month, 1 - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = date.getMonth() === month;
    return {
      date,
      key,
      day: date.getDate(),
      isCurrentMonth,
      isToday: key === todayKey,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      holidays: isCurrentMonth ? (byDate.get(key) ?? []) : [],
    };
  });
}

export function generateYearCalendar(
  year: number,
  holidays: CalendarHoliday[],
  weekStart: WeekStart = 'sun',
  today: Date = new Date()
): CalendarMonth[] {
  return MONTHS.map((name, month) => ({
    name,
    number: month,
    days: generateCalendarDays(year, month, holidays, weekStart, today),
  }));
}

export interface CalendarThemeColors {
  name: string;
  background: string;
  text: string;
  /** The single accent color: headings, holidays and the title bar */
  primary: string;
  /** Regular day cells */
  secondary: string;
  holiday: string;
  /** Custom days use a soft tint of the same accent */
  custom: string;
  soft: string;
}

/** Every calendar theme is built from one accent color and its tints */
function singleColor(
  name: string,
  accent: string,
  soft: string,
  tint: string,
  base: { background: string; text: string } = { background: '#ffffff', text: '#1f2937' }
): CalendarThemeColors {
  return { name, ...base, primary: accent, secondary: tint, holiday: accent, custom: accent, soft };
}

const themes = {
  festive: singleColor('Coral', '#d9432b', '#fbd5cd', '#fdf1ee'),
  default: singleColor('Blue', '#2563eb', '#cfe0fd', '#eff5ff'),
  ocean: singleColor('Teal', '#0d9488', '#c5ece8', '#effaf8'),
  forest: singleColor('Green', '#15803d', '#cdebd7', '#f0f9f3'),
  lavender: singleColor('Purple', '#7c3aed', '#e0d4fc', '#f6f2ff'),
  sunset: singleColor('Orange', '#ea580c', '#fdd9c2', '#fff4ec'),
  winter: singleColor('Rose', '#e11d48', '#fbd0da', '#fff0f3'),
  diwali: singleColor('Gold', '#b45309', '#f5dfb8', '#fdf7ec'),
  midnight: singleColor('Night', '#818cf8', '#2f3166', '#1d1f3a', { background: '#14152b', text: '#e5e7ff' }),
} satisfies Record<string, CalendarThemeColors>;

export type CalendarTheme = keyof typeof themes;

export const calendarThemes: Record<CalendarTheme, CalendarThemeColors> = themes;

export const CALENDAR_THEME_KEYS = Object.keys(calendarThemes) as [CalendarTheme, ...CalendarTheme[]];
