import { tv } from 'tailwind-variants'

export const box = tv({
  base: '',
  variants: {
    background: {
      background: ['bg-neutral-50', 'dark:bg-neutral-800'],
      surface: ['bg-white', 'dark:bg-neutral-900'],
      muted: ['bg-neutral-100', 'dark:bg-neutral-950'],
      subtle: ['bg-neutral-200', 'dark:bg-neutral-1000'],
    },
    border: {
      background: ['border border-neutral-100', 'dark:border-neutral-900'],
      surface: ['border border-neutral-50', 'dark:border-neutral-800'],
      muted: ['border border-neutral-200', 'dark:border-neutral-700'],
      subtle: ['border border-neutral-300', 'dark:border-neutral-600'],
    },
    elevation: {
      low: 'shadow-sm',
      mid: 'shadow-md',
      high: 'shadow-xl',
    },
  },
})
