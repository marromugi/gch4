import { tv } from 'tailwind-variants'

export const themeToggleButton = tv({
  base: [
    'flex items-center justify-center',
    'w-10 h-10',
    'rounded-full',
    'transition-colors duration-200',
    'text-neutral-600 dark:text-neutral-400',
    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    'hover:text-neutral-900 dark:hover:text-neutral-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400',
  ],
})
