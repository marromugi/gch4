import { tv } from 'tailwind-variants'

export const toast = tv({
  slots: {
    container: ['fixed', 'z-[100]', 'flex', 'flex-col', 'pointer-events-none', 'p-4'],
    item: [
      'pointer-events-auto',
      'relative',
      'flex',
      'flex-row',
      'items-center',
      'gap-1',
      'w-80',
      'rounded-2xl',
      'border',
      'border-neutral-200',
      'dark:border-neutral-700',
      'p-4',
      'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1)]',
      'dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-4px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-white',
      'dark:bg-neutral-900',
    ],
    iconWrapper: ['flex', 'items-center', 'justify-center', 'shrink-0', 'w-8', 'h-8'],
    content: ['flex', 'flex-col', 'flex-1', 'min-w-0'],
    title: ['text-sm', 'font-semibold', 'text-neutral-900', 'dark:text-neutral-50'],
    message: ['text-xs', 'text-neutral-600', 'dark:text-neutral-400'],
    closeButton: [
      'flex',
      'items-center',
      'justify-center',
      'shrink-0',
      'w-6',
      'h-6',
      'rounded-full',
      'cursor-pointer',
      'transition-colors',
      'text-neutral-400',
      'hover:bg-neutral-100',
      'hover:text-neutral-600',
      'dark:text-neutral-500',
      'dark:hover:bg-neutral-800',
      'dark:hover:text-neutral-300',
    ],
    progressBar: [
      'absolute',
      'bottom-0',
      'left-0',
      'h-1',
      'rounded-b-2xl',
      'origin-left',
      'bg-neutral-300',
      'dark:bg-neutral-600',
    ],
  },
  variants: {
    type: {
      default: {
        iconWrapper: ['text-neutral-500', 'dark:text-neutral-400'],
      },
      success: {
        item: [
          'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),inset_0_0_12px_rgba(34,197,94,0.15)]',
          'dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-4px_rgba(0,0,0,0.2),inset_0_0_12px_rgba(34,197,94,0.2)]',
        ],
        iconWrapper: [
          'text-green-600',
          'dark:text-green-500',
          'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]',
        ],
      },
      error: {
        item: [
          'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),inset_0_0_12px_rgba(239,68,68,0.15)]',
          'dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-4px_rgba(0,0,0,0.2),inset_0_0_12px_rgba(239,68,68,0.2)]',
        ],
        iconWrapper: [
          'text-red-500',
          'dark:text-red-500',
          'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        ],
      },
      warning: {
        item: [
          'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),inset_0_0_12px_rgba(251,191,36,0.15)]',
          'dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-4px_rgba(0,0,0,0.2),inset_0_0_12px_rgba(251,191,36,0.2)]',
        ],
        iconWrapper: [
          'text-amber-400',
          'dark:text-yellow-400',
          'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        ],
      },
      info: {
        item: [
          'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),inset_0_0_12px_rgba(59,130,246,0.15)]',
          'dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-4px_rgba(0,0,0,0.2),inset_0_0_12px_rgba(59,130,246,0.2)]',
        ],
        iconWrapper: [
          'text-blue-600',
          'dark:text-blue-500',
          'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
        ],
      },
    },
    position: {
      'top-right': {
        container: ['top-0', 'right-0', 'items-end'],
      },
      'top-left': {
        container: ['top-0', 'left-0', 'items-start'],
      },
      'top-center': {
        container: ['top-0', 'left-1/2', '-translate-x-1/2', 'items-center'],
      },
      'bottom-right': {
        container: ['bottom-0', 'right-0', 'items-end', 'flex-col-reverse'],
      },
      'bottom-left': {
        container: ['bottom-0', 'left-0', 'items-start', 'flex-col-reverse'],
      },
      'bottom-center': {
        container: ['bottom-0', 'left-1/2', '-translate-x-1/2', 'items-center', 'flex-col-reverse'],
      },
    },
  },
  defaultVariants: {
    type: 'default',
    position: 'top-right',
  },
})
