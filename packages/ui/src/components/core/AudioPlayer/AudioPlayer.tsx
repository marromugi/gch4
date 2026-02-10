import { cn } from '../../../lib'
import { PauseCircleFill, PlayCircleFill } from '../../icon'
import { AudioSeekBar } from './AudioSeekBar'
import { audioPlayer } from './const'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import type { AudioPlayerProps } from './type'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({ src, fileName, placeholder, className }: AudioPlayerProps) {
  const { isPlaying, currentTime, duration, toggle, seek } = useAudioPlayer(src)
  const styles = audioPlayer()

  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const displayName = fileName ?? placeholder

  return (
    <div className={cn(styles.root(), className)} onClick={handleContainerClick}>
      <button
        type="button"
        className={styles.playButton()}
        onClick={toggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <PauseCircleFill className={styles.playIcon()} />
        ) : (
          <PlayCircleFill className={styles.playIcon()} />
        )}
      </button>
      {/* 上段: ボタン、ファイル名、時間 */}
      <div className="flex flex-col gap-1.5 flex-1">
        <div className={styles.topRow()}>
          {displayName && (
            <span className={styles.fileName()} title={displayName}>
              {displayName}
            </span>
          )}

          <span className={styles.time()}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* 下段: シークバー */}
        <AudioSeekBar currentTime={currentTime} duration={duration} onSeek={seek} />
      </div>
    </div>
  )
}
