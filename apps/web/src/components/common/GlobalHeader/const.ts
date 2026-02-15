import { tv } from 'tailwind-variants'

export const globalHeader = tv({
  slots: {
    container: [
      'sticky top-0 z-50',
      'w-full',
      'h-14',
      'px-4 md:px-6',
      'border-b border-neutral-200 dark:border-neutral-800',
      'bg-white/80 dark:bg-neutral-950/80',
      'backdrop-blur-sm',
    ],
    inner: ['h-full', 'max-w-screen-xl', 'mx-auto'],
    logo: [
      'text-lg font-bold',
      'text-neutral-900 dark:text-neutral-100',
      'cursor-pointer',
      'hover:opacity-80',
      'transition-opacity',
    ],
    actions: [],
  },
})
