import { tv } from 'tailwind-variants'

export const statusBadge = tv({
  base: ['inline-flex', 'items-center', 'px-2', 'py-0.5', 'rounded-full', 'text-xs', 'font-medium'],
  variants: {
    status: {
      draft: ['bg-neutral-100', 'text-neutral-600', 'dark:bg-neutral-800', 'dark:text-neutral-400'],
      published: ['bg-green-100', 'text-green-700', 'dark:bg-green-900', 'dark:text-green-300'],
      closed: ['bg-red-100', 'text-red-700', 'dark:bg-red-900', 'dark:text-red-300'],
    },
  },
})

export const statusLabels = {
  draft: '下書き',
  published: '公開中',
  closed: '終了',
} as const
