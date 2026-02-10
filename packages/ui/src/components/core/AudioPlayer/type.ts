export interface AudioPlayerProps {
  src: string
  fileName?: string
  placeholder?: string
  className?: string
}

export interface AudioSeekBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  className?: string
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoaded: boolean
  toggle: () => void
  seek: (time: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}
