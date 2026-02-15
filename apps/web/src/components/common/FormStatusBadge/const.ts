import { CheckCircleFill, type ClipFill, Draft, PauseCircleFill } from '@ding/ui/icon'
import { tv } from 'tailwind-variants'
import type { FormStatus } from './type'

export const formStatusBadge = tv({
  base: [
    'inline-flex',
    'items-center justify-center',
    'gap-1',
    'px-3',
    'py-1',
    'min-w-24',
    'rounded-full',
    'text-sm',
    'font-semibold',
  ],
  variants: {
    status: {
      draft: ['bg-neutral-200', 'text-neutral-700', 'dark:bg-neutral-800', 'dark:text-neutral-300'],
      published: ['bg-green-100', 'text-green-700', 'dark:bg-green-900', 'dark:text-green-300'],
      closed: ['bg-red-100', 'text-red-700', 'dark:bg-red-900', 'dark:text-red-300'],
    },
  },
})

export const formStatusLabels: Record<FormStatus, string> = {
  draft: '下書き',
  published: '公開中',
  closed: '終了',
}

export const formStatusIcons: Record<FormStatus, typeof ClipFill> = {
  draft: Draft,
  published: CheckCircleFill,
  closed: PauseCircleFill,
}
