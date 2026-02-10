import { useState, useCallback, useRef, useEffect } from 'react'
import type { DragState, DragType, UseScheduleDragOptions, UseScheduleDragReturn } from './type'
import type { ScheduleEvent } from '../../type'
import { positionToHour, snapToTimeStep } from '../../utils'

const initialDragState: DragState = {
  isDragging: false,
  eventId: null,
  dragType: null,
  startY: 0,
  previewStartHour: 0,
  previewEndHour: 0,
  originalStartHour: 0,
  originalEndHour: 0,
}

/**
 * スケジュールイベントのドラッグ操作を管理するフック
 */
export function useScheduleDrag(options: UseScheduleDragOptions): UseScheduleDragReturn {
  const { timeStep, startHour, endHour, containerHeight, onTimeChange } = options

  const [dragState, setDragState] = useState<DragState>(initialDragState)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // コンテナ要素を設定するためのref callback
  const setContainerRef = useCallback((element: HTMLDivElement | null) => {
    containerRef.current = element
  }, [])

  // ドラッグ開始
  const handleDragStart = useCallback((type: DragType, event: ScheduleEvent, clientY: number) => {
    setDragState({
      isDragging: true,
      eventId: event.id,
      dragType: type,
      startY: clientY,
      previewStartHour: event.startHour,
      previewEndHour: event.endHour,
      originalStartHour: event.startHour,
      originalEndHour: event.endHour,
    })
  }, [])

  // ドラッグ中の処理
  const handleDrag = useCallback(
    (clientY: number) => {
      if (!dragState.isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const relativeY = clientY - rect.top
      const config = { startHour, endHour, containerHeight }

      // 現在のマウス位置から時間を計算
      const currentHour = positionToHour(relativeY, config)
      const snappedHour = snapToTimeStep(currentHour, timeStep)

      setDragState((prev) => {
        const duration = prev.originalEndHour - prev.originalStartHour

        let newStartHour = prev.originalStartHour
        let newEndHour = prev.originalEndHour

        switch (prev.dragType) {
          case 'move': {
            // 移動：deltaを計算してスナップ
            const deltaHour =
              snappedHour - snapToTimeStep(positionToHour(prev.startY - rect.top, config), timeStep)
            newStartHour = snapToTimeStep(prev.originalStartHour + deltaHour, timeStep)
            newEndHour = newStartHour + duration

            // 範囲内に収める
            if (newStartHour < startHour) {
              newStartHour = startHour
              newEndHour = startHour + duration
            }
            if (newEndHour > endHour) {
              newEndHour = endHour
              newStartHour = endHour - duration
            }
            break
          }
          case 'resizeTop': {
            // 上端リサイズ：開始時間を変更
            newStartHour = Math.min(snappedHour, prev.originalEndHour - timeStep / 60)
            newStartHour = Math.max(newStartHour, startHour)
            break
          }
          case 'resizeBottom': {
            // 下端リサイズ：終了時間を変更
            newEndHour = Math.max(snappedHour, prev.originalStartHour + timeStep / 60)
            newEndHour = Math.min(newEndHour, endHour)
            break
          }
        }

        return {
          ...prev,
          previewStartHour: newStartHour,
          previewEndHour: newEndHour,
        }
      })
    },
    [dragState.isDragging, startHour, endHour, containerHeight, timeStep]
  )

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging || !dragState.eventId) {
      setDragState(initialDragState)
      return
    }

    // 時間が変更された場合のみコールバックを呼び出し
    if (
      dragState.previewStartHour !== dragState.originalStartHour ||
      dragState.previewEndHour !== dragState.originalEndHour
    ) {
      onTimeChange?.({
        eventId: dragState.eventId,
        newStartHour: dragState.previewStartHour,
        newEndHour: dragState.previewEndHour,
      })
    }

    setDragState(initialDragState)
  }, [dragState, onTimeChange])

  // グローバルなmouse/touchイベントリスナー
  useEffect(() => {
    if (!dragState.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientY)
      }
    }

    const handleMouseUp = () => {
      handleDragEnd()
    }

    const handleTouchEnd = () => {
      handleDragEnd()
    }

    // イベントリスナーを追加
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)

    // クリーンアップ
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragState.isDragging, handleDrag, handleDragEnd])

  return {
    dragState,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    setContainerRef,
  } as UseScheduleDragReturn & { setContainerRef: typeof setContainerRef }
}
