import { tv } from 'tailwind-variants'

export const statusBadge = tv({
  base: [
    'inline-flex',
    'items-center',
    'px-2.5',
    'py-0.5',
    'rounded-full',
    'text-xs',
    'font-medium',
  ],
  variants: {
    status: {
      draft: ['bg-neutral-100', 'text-neutral-700', 'dark:bg-neutral-700', 'dark:text-neutral-300'],
      published: ['bg-green-100', 'text-green-700', 'dark:bg-green-900', 'dark:text-green-300'],
      closed: ['bg-red-100', 'text-red-700', 'dark:bg-red-900', 'dark:text-red-300'],
    },
  },
})
