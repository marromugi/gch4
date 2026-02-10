import { useMemo } from 'react'
import { cn } from '../../../lib/utils'
import { scheduleTimeLine, HOUR_HEIGHT_PX } from './const'
import type { ScheduleTimeLineProps } from './type'
import { formatHourLabel } from './utils'

/**
 * 時間線コンポーネント
 * 0時から24時までの時間ラベルを縦に表示
 */
export function ScheduleTimeLine({ startHour, endHour, className }: ScheduleTimeLineProps) {
  const styles = scheduleTimeLine()

  // 表示する時間のリストを生成
  const hours = useMemo(() => {
    const result: number[] = []
    for (let h = startHour; h <= endHour; h++) {
      result.push(h)
    }
    return result
  }, [startHour, endHour])

  const totalHours = endHour - startHour
  const containerHeight = totalHours * HOUR_HEIGHT_PX

  return (
    <div
      className={cn(styles.root(), className)}
      style={{ height: containerHeight }}
      aria-hidden="true"
    >
      {hours.map((hour) => {
        // 最後の時間（24時）は表示位置を少し上にずらす
        const isLast = hour === endHour
        const top = ((hour - startHour) / totalHours) * containerHeight

        return (
          <span
            key={hour}
            className={styles.hour()}
            style={{
              top: isLast ? top - 8 : top,
            }}
          >
            {formatHourLabel(hour)}
          </span>
        )
      })}
    </div>
  )
}
