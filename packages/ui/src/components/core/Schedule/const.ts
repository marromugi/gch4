import { tv } from 'tailwind-variants'

/**
 * メインScheduleコンポーネントのスタイル定義
 */
export const schedule = tv({
  slots: {
    root: [
      'relative',
      'w-full',
      'overflow-hidden',
      'rounded-2xl',
      'border',
      'border-neutral-200',
      'dark:border-neutral-700',
      'bg-white',
      'dark:bg-neutral-900',
    ],
    container: ['relative', 'flex', 'w-full', 'overflow-y-auto'],
    timeLineArea: [
      'flex-shrink-0',
      'w-14',
      'border-r',
      'border-neutral-200',
      'dark:border-neutral-700',
      'bg-neutral-50',
      'dark:bg-neutral-800/50',
    ],
    eventArea: ['relative', 'flex-1', 'min-h-0'],
    gridLines: ['absolute', 'inset-0', 'pointer-events-none'],
    gridLine: ['absolute', 'left-0', 'right-0', 'h-px', 'bg-neutral-200', 'dark:bg-neutral-700'],
    currentTimeIndicator: [
      'absolute',
      'left-0',
      'right-0',
      'h-0.5',
      'bg-red-500',
      'z-20',
      'pointer-events-none',
    ],
    currentTimeDot: [
      'absolute',
      'left-0',
      '-translate-x-1/2',
      '-translate-y-1/2',
      'w-2',
      'h-2',
      'rounded-full',
      'bg-red-500',
    ],
  },
})

/**
 * 時間線コンポーネントのスタイル定義
 */
export const scheduleTimeLine = tv({
  slots: {
    root: ['relative', 'h-full'],
    hour: [
      'absolute',
      'right-2',
      '-translate-y-1/2',
      'text-xs',
      'font-medium',
      'text-neutral-500',
      'dark:text-neutral-400',
      'select-none',
    ],
  },
})

/**
 * イベントコンポーネントのスタイル定義
 */
export const scheduleEvent = tv({
  slots: {
    root: [
      'absolute',
      'overflow-hidden',
      'rounded-md',
      'border',
      'cursor-pointer',
      'select-none',
      'transition-shadow',
      'duration-150',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-blue-500',
      'focus-visible:ring-offset-2',
      'dark:focus-visible:ring-offset-neutral-900',
    ],
    content: ['h-full', 'w-full', 'px-2', 'py-1', 'overflow-hidden'],
    title: ['text-xs', 'font-medium', 'line-clamp-2', 'break-words'],
    time: ['text-[10px]', 'opacity-75', 'mt-0.5'],
    resizeHandleTop: [
      'absolute',
      'top-0',
      'left-0',
      'right-0',
      'h-2',
      'cursor-ns-resize',
      'opacity-0',
      'hover:opacity-100',
      'transition-opacity',
      'bg-gradient-to-b',
      'from-black/20',
      'to-transparent',
    ],
    resizeHandleBottom: [
      'absolute',
      'bottom-0',
      'left-0',
      'right-0',
      'h-2',
      'cursor-ns-resize',
      'opacity-0',
      'hover:opacity-100',
      'transition-opacity',
      'bg-gradient-to-t',
      'from-black/20',
      'to-transparent',
    ],
  },
  variants: {
    isDragging: {
      true: {
        root: ['shadow-lg', 'z-30', 'opacity-90'],
      },
      false: {
        root: ['hover:shadow-md', 'z-10'],
      },
    },
    readOnly: {
      true: {
        root: ['cursor-default'],
        resizeHandleTop: ['hidden'],
        resizeHandleBottom: ['hidden'],
      },
    },
  },
  defaultVariants: {
    isDragging: false,
    readOnly: false,
  },
})

/**
 * デフォルトのイベント色パレット
 */
export const DEFAULT_EVENT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
] as const

/**
 * 1時間あたりのデフォルト高さ（px）
 */
export const HOUR_HEIGHT_PX = 60

/**
 * 時間線エリアの幅（px）
 */
export const TIME_LINE_WIDTH_PX = 56
