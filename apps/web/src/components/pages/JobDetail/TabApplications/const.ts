import { tv } from 'tailwind-variants'

export const tabApplications = tv({
  slots: {
    container: ['space-y-4'],
    emptyState: ['flex', 'flex-col', 'items-center', 'justify-center', 'py-12', 'text-center'],
    link: [
      'text-sm',
      'text-neutral-600',
      'dark:text-neutral-400',
      'underline',
      'hover:text-neutral-900',
      'dark:hover:text-neutral-100',
    ],
  },
})
