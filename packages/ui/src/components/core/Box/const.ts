import { tv } from 'tailwind-variants'

export const box = tv({
  base: '',
  variants: {
    background: {
      background: ['bg-gray-50', 'dark:bg-gray-950'],
      surface: ['bg-white', 'dark:bg-gray-900'],
      muted: ['bg-gray-100', 'dark:bg-gray-800'],
      subtle: ['bg-gray-200', 'dark:bg-gray-700'],
    },
    border: {
      background: ['border border-gray-100', 'dark:border-gray-900'],
      surface: ['border border-gray-50', 'dark:border-gray-800'],
      muted: ['border border-gray-200', 'dark:border-gray-700'],
      subtle: ['border border-gray-300', 'dark:border-gray-600'],
    },
    elevation: {
      low: 'shadow-sm',
      mid: 'shadow-md',
      high: 'shadow-xl',
    },
  },
})
