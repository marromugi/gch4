import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { cn } from '../../../lib/utils'
import { schedule, HOUR_HEIGHT_PX } from './const'
import { ScheduleTimeLine } from './ScheduleTimeLine'
import { ScheduleEventItem } from './ScheduleEvent'
import { useScheduleDrag } from './hooks/useScheduleDrag'
import type { ScheduleProps, DragType, ScheduleEvent as ScheduleEventType } from './type'
import {
  calculateEventLayout,
  getCurrentHour,
  hourToPosition,
  positionToHour,
  snapToTimeStep,
} from './utils'

/**
 * 縦型スケジュールコンポーネント
 *
 * 0時から24時までの時間線を縦に表示し、イベントを配置します。
 * ドラッグ操作でイベントの時間を変更できます。
 */
export function Schedule({
  events,
  onEventTimeChange,
  onEventClick,
  onEmptyClick,
  startHour = 0,
  endHour = 24,
  timeStep = 30,
  draggable = true,
  height = '600px',
  readOnly = false,
  className,
  ...props
}: ScheduleProps) {
  const styles = schedule()
  const containerRef = useRef<HTMLDivElement>(null)
  const eventAreaRef = useRef<HTMLDivElement>(null)

  // 現在時刻の状態（1分ごとに更新）
  const [currentHour, setCurrentHour] = useState(getCurrentHour)

  // コンテナの高さを計算
  const containerHeight = (endHour - startHour) * HOUR_HEIGHT_PX

  // 表示用の高さ
  const displayHeight = typeof height === 'number' ? `${height}px` : height

  // ドラッグフックの初期化
  const { dragState, handleDragStart, setContainerRef } = useScheduleDrag({
    timeStep,
    startHour,
    endHour,
    containerHeight,
    onTimeChange: onEventTimeChange,
  }) as ReturnType<typeof useScheduleDrag> & {
    setContainerRef: (el: HTMLDivElement | null) => void
  }

  // イベントエリアの参照を設定
  useEffect(() => {
    if (eventAreaRef.current) {
      setContainerRef(eventAreaRef.current)
    }
  }, [setContainerRef])

  // 現在時刻の更新（1分ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(getCurrentHour())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // イベントのレイアウトを計算
  const eventLayouts = useMemo(() => {
    const config = { startHour, endHour, containerHeight }
    return calculateEventLayout(events, config)
  }, [events, startHour, endHour, containerHeight])

  // グリッド線の生成
  const gridLines = useMemo(() => {
    const lines: number[] = []
    for (let h = startHour; h <= endHour; h++) {
      lines.push(h)
    }
    return lines
  }, [startHour, endHour])

  // 空き時間クリックハンドラ
  const handleEmptyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onEmptyClick || readOnly) return
      if (e.target !== e.currentTarget) return // イベント上のクリックは除外

      const rect = e.currentTarget.getBoundingClientRect()
      const relativeY = e.clientY - rect.top
      const config = { startHour, endHour, containerHeight }
      const hour = positionToHour(relativeY, config)
      const snappedHour = snapToTimeStep(hour, timeStep)
      onEmptyClick(snappedHour)
    },
    [onEmptyClick, readOnly, startHour, endHour, containerHeight, timeStep]
  )

  // ドラッグ開始ハンドラ
  const handleEventDragStart = useCallback(
    (type: DragType, event: ScheduleEventType) => {
      if (readOnly || !draggable) return

      // マウス位置を取得（グローバルイベントから）
      const getClientY = () => {
        // 初期位置はイベントの中央
        const layout = eventLayouts.get(event.id)
        if (layout && eventAreaRef.current) {
          const rect = eventAreaRef.current.getBoundingClientRect()
          return rect.top + layout.top + layout.height / 2
        }
        return 0
      }

      handleDragStart(type, event, getClientY())
    },
    [readOnly, draggable, handleDragStart, eventLayouts]
  )

  // 現在時刻インジケーターの位置
  const currentTimePosition = useMemo(() => {
    if (currentHour < startHour || currentHour > endHour) return null
    return hourToPosition(currentHour, { startHour, endHour, containerHeight })
  }, [currentHour, startHour, endHour, containerHeight])

  return (
    <div
      ref={containerRef}
      className={cn(styles.root(), className)}
      style={{ height: displayHeight }}
      {...props}
    >
      <div className={styles.container()} style={{ height: containerHeight }}>
        {/* 時間線エリア */}
        <div className={styles.timeLineArea()}>
          <ScheduleTimeLine startHour={startHour} endHour={endHour} />
        </div>

        {/* イベントエリア */}
        <div
          ref={eventAreaRef}
          className={styles.eventArea()}
          onClick={handleEmptyClick}
          style={{ height: containerHeight }}
        >
          {/* グリッド線 */}
          <div className={styles.gridLines()}>
            {gridLines.map((hour) => {
              const top = hourToPosition(hour, {
                startHour,
                endHour,
                containerHeight,
              })
              return <div key={hour} className={styles.gridLine()} style={{ top }} />
            })}
          </div>

          {/* 現在時刻インジケーター */}
          {currentTimePosition !== null && (
            <div className={styles.currentTimeIndicator()} style={{ top: currentTimePosition }}>
              <div className={styles.currentTimeDot()} />
            </div>
          )}

          {/* イベント */}
          {events.map((event) => {
            const layout = eventLayouts.get(event.id)
            if (!layout) return null

            const isDragging = dragState.isDragging && dragState.eventId === event.id

            return (
              <ScheduleEventItem
                key={event.id}
                event={event}
                layout={
                  isDragging
                    ? {
                        ...layout,
                        top: hourToPosition(dragState.previewStartHour, {
                          startHour,
                          endHour,
                          containerHeight,
                        }),
                        height:
                          hourToPosition(dragState.previewEndHour, {
                            startHour,
                            endHour,
                            containerHeight,
                          }) -
                          hourToPosition(dragState.previewStartHour, {
                            startHour,
                            endHour,
                            containerHeight,
                          }),
                      }
                    : layout
                }
                startHour={startHour}
                endHour={endHour}
                onClick={() => onEventClick?.(event)}
                draggable={draggable && !readOnly}
                readOnly={readOnly}
                onDragStart={handleEventDragStart}
                previewStartHour={isDragging ? dragState.previewStartHour : undefined}
                previewEndHour={isDragging ? dragState.previewEndHour : undefined}
                isDragging={isDragging}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
