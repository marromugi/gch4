import type { CalendarMarker } from './type'

export interface DayInfo {
  date: Date
  isOutside: boolean
  isToday: boolean
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function generateCalendarDays(year: number, month: number, weekStartsOn: 0 | 1): DayInfo[] {
  const today = new Date()
  const days: DayInfo[] = []

  const firstDayOfMonth = new Date(year, month, 1)
  let startDayOfWeek = firstDayOfMonth.getDay() - weekStartsOn
  if (startDayOfWeek < 0) startDayOfWeek += 7

  // 前月の日付
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(prevYear, prevMonth, daysInPrevMonth - i)
    days.push({ date, isOutside: true, isToday: isSameDay(date, today) })
  }

  // 当月の日付
  const daysInMonth = getDaysInMonth(year, month)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({ date, isOutside: false, isToday: isSameDay(date, today) })
  }

  // 翌月の日付（当月の日が含まれる週のみ表示）
  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7
  const remaining = totalCells - days.length
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(nextYear, nextMonth, d)
    days.push({ date, isOutside: true, isToday: isSameDay(date, today) })
  }

  return days
}

export function getWeekdayNames(locale: string, weekStartsOn: 0 | 1): string[] {
  const names: string[] = []
  // 2024-01-07 は日曜日
  const baseSunday = new Date(2024, 0, 7)
  for (let i = 0; i < 7; i++) {
    const dayIndex = (i + weekStartsOn) % 7
    const date = new Date(baseSunday)
    date.setDate(baseSunday.getDate() + dayIndex)
    names.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date))
  }
  return names
}

export function getMonthLabel(month: number, locale: string): string {
  const date = new Date(2000, month, 1)
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
  }).format(date)
}

export function getYearLabel(
  year: number,

  locale: string
): string {
  const date = new Date(year, 1, 1)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
  }).format(date)
}

export function getMarkersForDate(date: Date, markers: CalendarMarker[]): CalendarMarker[] {
  return markers.filter((m) => isSameDay(m.date, date))
}
