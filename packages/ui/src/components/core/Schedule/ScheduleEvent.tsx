import { useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../../lib/utils'
import { scheduleEvent, DEFAULT_EVENT_COLORS } from './const'
import type { ScheduleEventItemProps, DragType } from './type'
import { formatHour, getEventColors } from './utils'

/**
 * スケジュールイベントコンポーネント
 * 個々のイベントを表示し、ドラッグ操作を処理
 */
export function ScheduleEventItem({
  event,
  layout,
  startHour: _startHour,
  endHour: _endHour,
  onClick,
  draggable = true,
  readOnly = false,
  onDragStart,
  previewStartHour,
  previewEndHour,
  isDragging = false,
}: ScheduleEventItemProps) {
  const styles = scheduleEvent({ isDragging, readOnly })
  const eventRef = useRef<HTMLDivElement>(null)

  // イベント色の取得
  const baseColor =
    event.color ?? DEFAULT_EVENT_COLORS[parseInt(event.id, 36) % DEFAULT_EVENT_COLORS.length]
  const colors = getEventColors(baseColor)

  // 表示用の時間（ドラッグ中はプレビュー値を使用）
  const displayStartHour = previewStartHour ?? event.startHour
  const displayEndHour = previewEndHour ?? event.endHour

  // ドラッグ開始ハンドラ
  const handleMouseDown = useCallback(
    (type: DragType) => (e: React.MouseEvent) => {
      if (readOnly || !draggable) return
      e.preventDefault()
      e.stopPropagation()
      onDragStart?.(type, event)
    },
    [readOnly, draggable, onDragStart, event]
  )

  // タッチ開始ハンドラ
  const handleTouchStart = useCallback(
    (type: DragType) => (e: React.TouchEvent) => {
      if (readOnly || !draggable) return
      e.stopPropagation()
      onDragStart?.(type, event)
    },
    [readOnly, draggable, onDragStart, event]
  )

  // クリックハンドラ
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // ドラッグ中はクリックイベントを発火しない
      if (isDragging) return
      e.stopPropagation()
      onClick?.()
    },
    [onClick, isDragging]
  )

  // キーボードハンドラ
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick?.()
      }
    },
    [onClick]
  )

  // aria-label の生成
  const ariaLabel = `${event.title}, ${formatHour(displayStartHour)}から${formatHour(displayEndHour)}まで`

  // 左右のマージンを追加して見やすく
  const marginLeft = 2
  const marginRight = 4

  return (
    <motion.div
      ref={eventRef}
      className={cn(styles.root())}
      style={{
        top: layout.top,
        height: Math.max(layout.height, 20), // 最小高さを確保
        left: `calc(${layout.left * 100}% + ${marginLeft}px)`,
        width: `calc(${layout.width * 100}% - ${marginLeft + marginRight}px)`,
        backgroundColor: colors.background,
        borderColor: colors.border,
        zIndex: layout.zIndex,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      layout={isDragging}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* イベント内容 */}
      <div className={styles.content()}>
        <div className={styles.title()} style={{ color: colors.text }}>
          {event.title}
        </div>
        {layout.height > 40 && (
          <div className={styles.time()} style={{ color: colors.text }}>
            {formatHour(displayStartHour)} - {formatHour(displayEndHour)}
          </div>
        )}
      </div>

      {/* 上端リサイズハンドル */}
      {!readOnly && draggable && (
        <div
          className={styles.resizeHandleTop()}
          onMouseDown={handleMouseDown('resizeTop')}
          onTouchStart={handleTouchStart('resizeTop')}
          aria-hidden="true"
        />
      )}

      {/* 下端リサイズハンドル */}
      {!readOnly && draggable && (
        <div
          className={styles.resizeHandleBottom()}
          onMouseDown={handleMouseDown('resizeBottom')}
          onTouchStart={handleTouchStart('resizeBottom')}
          aria-hidden="true"
        />
      )}

      {/* 中央部分（移動用） */}
      {!readOnly && draggable && (
        <div
          className="absolute inset-x-0 top-2 bottom-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown('move')}
          onTouchStart={handleTouchStart('move')}
          aria-hidden="true"
        />
      )}
    </motion.div>
  )
}
