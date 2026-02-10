import { describe, expect, it } from 'vitest'
import {
  generateCalendarDays,
  getDaysInMonth,
  getMarkersForDate,
  getWeekdayNames,
  isSameDay,
} from './utils'

describe('isSameDay', () => {
  it('同じ日付ならtrueを返す', () => {
    const a = new Date(2024, 5, 15, 10, 30)
    const b = new Date(2024, 5, 15, 22, 0)
    expect(isSameDay(a, b)).toBe(true)
  })

  it('異なる日付ならfalseを返す', () => {
    const a = new Date(2024, 5, 15)
    const b = new Date(2024, 5, 16)
    expect(isSameDay(a, b)).toBe(false)
  })

  it('異なる月ならfalseを返す', () => {
    const a = new Date(2024, 5, 15)
    const b = new Date(2024, 6, 15)
    expect(isSameDay(a, b)).toBe(false)
  })

  it('異なる年ならfalseを返す', () => {
    const a = new Date(2024, 5, 15)
    const b = new Date(2025, 5, 15)
    expect(isSameDay(a, b)).toBe(false)
  })
})

describe('getDaysInMonth', () => {
  it('1月は31日', () => {
    expect(getDaysInMonth(2024, 0)).toBe(31)
  })

  it('4月は30日', () => {
    expect(getDaysInMonth(2024, 3)).toBe(30)
  })

  it('2024年2月はうるう年で29日', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29)
  })

  it('2023年2月は平年で28日', () => {
    expect(getDaysInMonth(2023, 1)).toBe(28)
  })

  it('12月は31日', () => {
    expect(getDaysInMonth(2024, 11)).toBe(31)
  })
})

describe('generateCalendarDays', () => {
  it('常に7の倍数の長さを返す', () => {
    // 複数の月でチェック
    for (let month = 0; month < 12; month++) {
      const days = generateCalendarDays(2025, month, 0)
      expect(days.length % 7).toBe(0)
    }
  })

  it('4週の月: 2015年2月（日曜始まり・28日）は28日分を返す', () => {
    // 2015年2月1日は日曜日、28日間
    const days = generateCalendarDays(2015, 1, 0)
    expect(days).toHaveLength(28)
  })

  it('5週の月: 2025年1月（水曜始まり・31日）は35日分を返す', () => {
    // 2025年1月1日は水曜日、31日間
    const days = generateCalendarDays(2025, 0, 0)
    expect(days).toHaveLength(35)
  })

  it('6週の月: 2025年3月（土曜始まり・31日）は42日分を返す', () => {
    // 2025年3月1日は土曜日、31日間
    const days = generateCalendarDays(2025, 2, 0)
    expect(days).toHaveLength(42)
  })

  it('月曜始まりで週数が変わる', () => {
    // 2025年9月1日は月曜日、30日間
    // weekStartsOn=1: startDayOfWeek=0, ceil(30/7)=5 → 35日
    const daysMon = generateCalendarDays(2025, 8, 1)
    expect(daysMon).toHaveLength(35)
    // weekStartsOn=0: startDayOfWeek=1, ceil(31/7)=5 → 35日
    const daysSun = generateCalendarDays(2025, 8, 0)
    expect(daysSun).toHaveLength(35)
  })

  it('当月の日付はisOutside=falseになる', () => {
    const days = generateCalendarDays(2024, 5, 0) // 2024年6月
    const juneDays = days.filter((d) => !d.isOutside)
    expect(juneDays).toHaveLength(30) // 6月は30日
  })

  it('前月・翌月の日付はisOutside=trueになる', () => {
    const days = generateCalendarDays(2024, 5, 0) // 2024年6月（6週）
    const daysInMonth = 30
    const outsideDays = days.filter((d) => d.isOutside)
    expect(outsideDays.length).toBe(days.length - daysInMonth)
  })

  it('weekStartsOn=0 で日曜始まりになる', () => {
    // 2024年6月1日は土曜日（getDay()=6）
    const days = generateCalendarDays(2024, 5, 0)
    // 日曜始まりなので、最初の6日は前月
    const firstDay = days[0]
    expect(firstDay.isOutside).toBe(true)
    expect(firstDay.date.getDay()).toBe(0) // 日曜日
  })

  it('weekStartsOn=1 で月曜始まりになる', () => {
    // 2024年6月1日は土曜日
    const days = generateCalendarDays(2024, 5, 1)
    const firstDay = days[0]
    expect(firstDay.date.getDay()).toBe(1) // 月曜日
  })

  it('1月の前月は前年12月になる', () => {
    const days = generateCalendarDays(2024, 0, 0) // 2024年1月
    const outsideBefore = days.filter((d) => d.isOutside && d.date < new Date(2024, 0, 1))
    outsideBefore.forEach((d) => {
      expect(d.date.getFullYear()).toBe(2023)
      expect(d.date.getMonth()).toBe(11) // 12月
    })
  })

  it('12月の翌月は翌年1月になる', () => {
    const days = generateCalendarDays(2024, 11, 0) // 2024年12月
    const outsideAfter = days.filter((d) => d.isOutside && d.date > new Date(2024, 11, 31))
    outsideAfter.forEach((d) => {
      expect(d.date.getFullYear()).toBe(2025)
      expect(d.date.getMonth()).toBe(0) // 1月
    })
  })

  it('日付が昇順で並んでいる', () => {
    const days = generateCalendarDays(2024, 5, 0)
    for (let i = 1; i < days.length; i++) {
      expect(days[i].date.getTime()).toBeGreaterThan(days[i - 1].date.getTime())
    }
  })
})

describe('getWeekdayNames', () => {
  it('7つの曜日名を返す', () => {
    const names = getWeekdayNames('en', 0)
    expect(names).toHaveLength(7)
  })

  it('weekStartsOn=0 で日曜始まり（en）', () => {
    const names = getWeekdayNames('en', 0)
    expect(names[0]).toBe('Sun')
    expect(names[6]).toBe('Sat')
  })

  it('weekStartsOn=1 で月曜始まり（en）', () => {
    const names = getWeekdayNames('en', 1)
    expect(names[0]).toBe('Mon')
    expect(names[6]).toBe('Sun')
  })

  it('日本語ロケールで曜日名を返す', () => {
    const names = getWeekdayNames('ja', 0)
    expect(names).toHaveLength(7)
    expect(names[0]).toBe('日')
    expect(names[6]).toBe('土')
  })
})

describe('getMarkersForDate', () => {
  const markers = [
    { date: new Date(2024, 5, 15), color: 'red' },
    { date: new Date(2024, 5, 15), color: 'blue' },
    { date: new Date(2024, 5, 20), color: 'green' },
  ]

  it('該当日のマーカーだけを返す', () => {
    const result = getMarkersForDate(new Date(2024, 5, 15), markers)
    expect(result).toHaveLength(2)
    expect(result[0].color).toBe('red')
    expect(result[1].color).toBe('blue')
  })

  it('マーカーがない日は空配列を返す', () => {
    const result = getMarkersForDate(new Date(2024, 5, 10), markers)
    expect(result).toHaveLength(0)
  })

  it('空のマーカー配列でも動作する', () => {
    const result = getMarkersForDate(new Date(2024, 5, 15), [])
    expect(result).toHaveLength(0)
  })
})
