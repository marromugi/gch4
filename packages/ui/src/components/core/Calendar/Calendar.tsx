import { useMemo, useState } from 'react'
import { cn } from '../../../lib'
import { ChevronLeft } from '../../icon/ChevronLeft'
import { ChevronRight } from '../../icon/ChevronRight'
import { calendar, calendarCell } from './const'
import {
  generateCalendarDays,
  getMarkersForDate,
  getMonthLabel,
  getWeekdayNames,
  getYearLabel,
  isSameDay,
} from './utils'
import type { CalendarProps } from './type'
import type { DayInfo } from './utils'

export const Calendar = ({
  value,
  defaultValue,
  onChange,
  locale = 'en',
  weekStartsOn = 0,
  markers = [],
  className,
}: CalendarProps) => {
  const initialDate = value ?? defaultValue ?? new Date()
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())
  const [internalValue, setInternalValue] = useState<Date | undefined>(defaultValue)

  const selectedDate = value ?? internalValue
  const styles = calendar()

  const days = useMemo(
    () => generateCalendarDays(viewYear, viewMonth, weekStartsOn),
    [viewYear, viewMonth, weekStartsOn]
  )

  const weekdayNames = useMemo(() => getWeekdayNames(locale, weekStartsOn), [locale, weekStartsOn])

  const monthLabel = useMemo(() => getMonthLabel(viewMonth, locale), [viewMonth, locale])

  const yearLabel = useMemo(() => getYearLabel(viewYear, locale), [viewYear, locale])

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleDateClick = (day: DayInfo) => {
    if (value === undefined) {
      setInternalValue(day.date)
    }
    onChange?.(day.date)
  }

  return (
    <div className={cn(styles.root(), className)}>
      {/* ヘッダー */}
      <div className={styles.header()}>
        <span className="ml-2">
          <span className={styles.title()}>{monthLabel}</span>
          <span className={styles.subTitle()}>{yearLabel}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={styles.navButton()}
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft width={24} height={24} />
          </button>
          <button
            type="button"
            className={styles.navButton()}
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight width={24} height={24} />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className={styles.weekdays()}>
        {weekdayNames.map((name) => (
          <div key={name} className={styles.weekday()}>
            {name}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className={styles.grid()}>
        {days.map((day) => {
          const isSelected = selectedDate ? isSameDay(day.date, selectedDate) : false
          const dayMarkers = getMarkersForDate(day.date, markers)

          return (
            <button
              key={day.date.toISOString()}
              type="button"
              className={calendarCell({
                isOutside: day.isOutside,
                isSelected,
                isToday: day.isToday,
              })}
              onClick={() => handleDateClick(day)}
              aria-label={day.date.toLocaleDateString(locale)}
              aria-selected={isSelected}
            >
              {day.date.getDate()}
              {dayMarkers.length > 0 && (
                <span className={styles.dotContainer()}>
                  {dayMarkers.map((marker, i) => (
                    <span
                      key={i}
                      className={styles.dot()}
                      style={{ backgroundColor: marker.color }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
