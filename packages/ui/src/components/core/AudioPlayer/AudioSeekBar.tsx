import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../../../lib'
import { audioPlayer } from './const'
import type { AudioSeekBarProps } from './type'

export function AudioSeekBar({ currentTime, duration, onSeek, className }: AudioSeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const styles = audioPlayer()

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const calculateTimeFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || duration <= 0) return null

      const rect = track.getBoundingClientRect()
      const position = clientX - rect.left
      const percentage = position / rect.width
      return Math.max(0, Math.min(duration, percentage * duration))
    },
    [duration]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const newTime = calculateTimeFromPosition(e.clientX)
      if (newTime !== null) {
        onSeek(newTime)
      }
    },
    [calculateTimeFromPosition, onSeek]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(true)
      const newTime = calculateTimeFromPosition(e.clientX)
      if (newTime !== null) {
        onSeek(newTime)
      }
    },
    [calculateTimeFromPosition, onSeek]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newTime = calculateTimeFromPosition(e.clientX)
      if (newTime !== null) {
        onSeek(newTime)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, calculateTimeFromPosition, onSeek])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (duration <= 0) return

      const step = 5
      let newTime = currentTime

      switch (e.key) {
        case 'ArrowLeft':
          newTime = Math.max(0, currentTime - step)
          break
        case 'ArrowRight':
          newTime = Math.min(duration, currentTime + step)
          break
        case 'Home':
          newTime = 0
          break
        case 'End':
          newTime = duration
          break
        default:
          return
      }

      e.preventDefault()
      onSeek(newTime)
    },
    [currentTime, duration, onSeek]
  )

  return (
    <div className={cn(styles.seekBar(), className)}>
      <div
        ref={trackRef}
        className={styles.seekBarTrack()}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-label="Audio seek bar"
        tabIndex={0}
      >
        <div className={styles.seekBarProgress()} style={{ width: `${progressPercent}%` }} />
        <div
          className={cn(styles.seekBarThumb(), isDragging && styles.seekBarThumbDragging())}
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
