import { Holiday } from "./holidays-api"

export interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  holiday?: Holiday
}

export interface CalendarMonth {
  name: string
  number: number
  days: CalendarDay[]
}

export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months[month]!
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function generateCalendarDays(
  year: number,
  month: number,
  holidays: Holiday[]
): CalendarDay[] {
  const days: CalendarDay[] = []
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()

  const prevMonthDays = getDaysInMonth(year, month - 1)
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i)
    days.push({
      date,
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    const holiday = holidays.find(h => h.date === dateStr)

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday,
      holiday,
    })
  }

  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  return days
}

export function generateYearCalendar(
  year: number,
  holidays: Holiday[]
): CalendarMonth[] {
  const months: CalendarMonth[] = []

  for (let month = 0; month < 12; month++) {
    months.push({
      name: getMonthName(month),
      number: month,
      days: generateCalendarDays(year, month, holidays),
    })
  }

  return months
}

export const calendarThemes = {
  default: {
    name: "Default",
    background: "#ffffff",
    text: "#000000",
    primary: "#3b82f6",
    secondary: "#e5e7eb",
    holiday: "#ef4444",
  },
  dark: {
    name: "Dark",
    background: "#1f2937",
    text: "#f9fafb",
    primary: "#3b82f6",
    secondary: "#374151",
    holiday: "#ef4444",
  },
  ocean: {
    name: "Ocean",
    background: "#f0f9ff",
    text: "#0c4a6e",
    primary: "#0ea5e9",
    secondary: "#bae6fd",
    holiday: "#0284c7",
  },
  sunset: {
    name: "Sunset",
    background: "#fff7ed",
    text: "#7c2d12",
    primary: "#f97316",
    secondary: "#fed7aa",
    holiday: "#ea580c",
  },
  forest: {
    name: "Forest",
    background: "#f0fdf4",
    text: "#14532d",
    primary: "#22c55e",
    secondary: "#bbf7d0",
    holiday: "#16a34a",
  },
  lavender: {
    name: "Lavender",
    background: "#faf5ff",
    text: "#581c87",
    primary: "#a855f7",
    secondary: "#e9d5ff",
    holiday: "#9333ea",
  },
}

export type CalendarTheme = keyof typeof calendarThemes
