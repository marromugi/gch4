import { tv } from 'tailwind-variants'

export const formDetailHeader = tv({
  slots: {
    container: [],
    titleRow: ['mb-2'],
    backLink: [
      'text-sm',
      'text-neutral-500',
      'dark:text-neutral-400',
      'hover:text-neutral-700',
      'dark:hover:text-neutral-200',
      'cursor-pointer',
      'mb-4',
    ],
  },
})
