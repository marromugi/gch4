import { tv } from 'tailwind-variants'

export const calendar = tv({
  slots: {
    root: ['w-full', 'select-none'],
    header: ['flex', 'items-center', 'justify-between', 'mb-1'],
    title: [
      'text-lg',
      'font-semibold',
      'text-neutral-900',
      'dark:text-neutral-50',
      'w-11 inline-block',
    ],
    subTitle: ['text-sm', 'font-semibold', 'text-neutral-400', 'dark:text-neutral-600'],
    navButton: [
      'inline-flex',
      'items-center',
      'justify-center',
      'w-10',
      'h-10',
      'rounded-lg',
      'text-neutral-600',
      'dark:text-neutral-400',
      'hover:bg-neutral-100',
      'dark:hover:bg-neutral-800',
      'transition-colors',
      'duration-200',
      'cursor-pointer',
    ],
    weekdays: ['grid', 'grid-cols-7'],
    weekday: [
      'text-xs',
      'font-medium',
      'text-center',
      'pb-3',
      'text-neutral-500',
      'dark:text-neutral-400',
    ],
    grid: ['grid', 'grid-cols-7', 'gap-1'],
    cell: [
      'relative',
      'flex',
      'items-center',
      'justify-center',
      'w-full',
      'aspect-square',
      'text-sm',
      'rounded-full',
      'cursor-pointer',
    ],
    dotContainer: [
      'absolute',
      'bottom-[6px]',
      'left-1/2',
      '-translate-x-1/2',
      'flex',
      'items-center',
      'gap-0.5',
    ],
    dot: ['w-1.5', 'h-1.5', 'rounded-full'],
  },
})

export const calendarCell = tv({
  base: [
    'relative',
    'flex',
    'items-center',
    'justify-center',
    'w-full',
    'aspect-square',
    'text-sm',
    'rounded-lg',
    'cursor-pointer',
    'text-neutral-900',
    'dark:text-neutral-50',
    'hover:bg-neutral-100',
    'dark:hover:bg-neutral-700',
    'bg-neutral-100 dark:bg-neutral-800',
  ],
  variants: {
    isOutside: {
      true: [
        'bg-neutral-50 dark:bg-neutral-900',
        'text-neutral-300',
        'dark:text-neutral-700',
        'hover:bg-neutral-50',
        'dark:hover:bg-neutral-900',
      ],
    },
    isSelected: {
      true: [
        'transition-colors',
        'bg-neutral-900!',
        'text-white!',
        'hover:bg-neutral-800!',
        'dark:bg-neutral-100!',
        'dark:text-neutral-900!',
        'dark:hover:bg-neutral-200!',
      ],
    },
    isToday: {
      true: ['font-semibold', 'bg-gray-200 dark:bg-neutral-700'],
    },
  },
  compoundVariants: [
    {
      isSelected: true,
      isToday: true,
      className: ['ring-0'],
    },
  ],
})
